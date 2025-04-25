package services

import (
	"crypto/tls"
	"errors"
	"fmt"
	"ldap-explorer-go/tree"
	"log"
	"log/slog"
	"time"

	"github.com/go-ldap/ldap/v3"
)

const PAGE_SIZE = 100

var runOnce = true

type Option = func(*LdapConn)

type LdapConn struct {
	conn           *ldap.Conn `json:"-"`
	isConnected    bool       `json:"-"`
	closeChan      chan bool  `json:"-"`
	Key            string     `json:"key"`
	Host           string     `json:"host"`
	Port           string     `json:"port"`
	Username       string     `json:"username"`
	Password       string     `json:"password"`
	Name           string     `json:"name"`
	BaseDN         string     `json:"base_dn"`
	IsFavorited    bool       `json:"is_favorited"`
	UseTls         bool       `json:"use_tls"`
	pagingControls map[string]*ldap.ControlPaging
}

type SearchResult struct {
	Tree    *tree.Tree
	HasMore bool
}

func NewLdapConn(opts ...Option) (*LdapConn, error) {
	l := &LdapConn{closeChan: make(chan bool)}
	for _, opt := range opts {
		opt(l)
	}
	return l, nil
}

func (l *LdapConn) Connect() error {
	if l.isConnected {
		return errors.New("already connected")
	}

	protocol := "ldap"
	if l.UseTls {
		protocol = "ldaps"
	}

	tlsConfig := &tls.Config{InsecureSkipVerify: true}
	slog.Info("url", "url", fmt.Sprintf("%s://%s:%s", protocol, l.Host, l.Port))
	conn, err := ldap.DialURL(fmt.Sprintf("%s://%s:%s", protocol, l.Host, l.Port), ldap.DialWithTLSConfig(tlsConfig))
	if err != nil {
		slog.Info("Failed to dial LDAP server", "err", err)
		return err
	}
	if err := conn.Bind(l.Username, l.Password); err != nil {
		slog.Info("failed", "username", l.Username, "password", l.Password)
		slog.Error("Failed to bind to LDAP server", "err", err)
		return err
	}
	l.conn = conn
	l.isConnected = true
	l.pagingControls = make(map[string]*ldap.ControlPaging)
	if runOnce {
		go l.backgroundConnectionPoll()
		runOnce = false
	}
	return nil
}

func (l *LdapConn) backgroundConnectionPoll() {
	slog.Info("starting background connection poll")
	for {
		time.Sleep(200 * time.Millisecond)
		select {
		case <-l.closeChan:
			slog.Info("returning from backgroundConnectionPoll")
			return
		default:
			if l.conn.IsClosing() {
				slog.Info("connection is closing")
				l.isConnected = false
				err := l.Connect()
				if err != nil {
					slog.Error("Failed to reconnect to LDAP server: ", "err", err)
				}
				return
			}
		}
	}
}

func (l *LdapConn) Disconnect() error {
	l.closeChan <- true
	return l.conn.Close()
}

func WithHost(host string) Option {
	return func(l *LdapConn) {
		l.Host = host
	}
}

func WithPort(port string) Option {
	return func(l *LdapConn) {
		l.Port = port
	}
}

func WithUsername(username string) Option {
	return func(l *LdapConn) {
		l.Username = username
	}
}

func WithPassword(password string) Option {
	return func(l *LdapConn) {
		l.Password = password
	}
}

func WithName(name string) Option {
	return func(l *LdapConn) {
		l.Name = name
	}
}

func WithBaseDN(baseDN string) Option {
	return func(l *LdapConn) {
		l.BaseDN = baseDN
	}
}

func WithKey(key string) Option {
	return func(l *LdapConn) {
		l.Key = key
	}
}

func WithUseTls(useTls bool) Option {
	return func(l *LdapConn) {
		l.UseTls = useTls
	}
}

func (l *LdapConn) Search(search string) (*SearchResult, error) {
	slog.Info("begin search request", "search", search)
	now := time.Now()
	result := &SearchResult{}

	if _, ok := l.pagingControls[search]; !ok {
		l.pagingControls[search] = ldap.NewControlPaging(PAGE_SIZE)
	}

	searchRequest := ldap.NewSearchRequest(
		l.BaseDN, // The base dn to search
		ldap.ScopeWholeSubtree, ldap.NeverDerefAliases, 0, 0, false,
		ldap.EscapeFilter(search), // The filter to apply
		[]string{},
		[]ldap.Control{l.pagingControls[search]},
	)

	sr, err := l.conn.Search(searchRequest)
	if err != nil {
		slog.Info("end search request", "search", search, "duration", time.Since(now))
		slog.Error("Error searching", "error", err)
		return nil, err
	}
	updatedControl := ldap.FindControl(sr.Controls, ldap.ControlTypePaging)
	if ctrl, ok := updatedControl.(*ldap.ControlPaging); ctrl != nil && ok && len(ctrl.Cookie) != 0 {
		l.pagingControls[search].SetCookie(ctrl.Cookie)
		result.HasMore = true
	} else {
		l.pagingControls[search].SetCookie(nil)
	}

	t := tree.NewTree(l.BaseDN)

	for _, entry := range sr.Entries {
		m := make(map[string][]string)
		for _, attr := range entry.Attributes {
			m[attr.Name] = attr.Values
		}
		t.AddEntry(&tree.LDAPEntry{
			DN:    entry.DN,
			Attrs: m,
		})
	}
	result.Tree = t

	slog.Info("end search request", "search", search, "duration", time.Since(now))

	return result, nil
}

func (l *LdapConn) SearchOneLayer(ouPath string) (*SearchResult, error) {
	searchBaseDN := l.BaseDN
	if ouPath != "" {
		searchBaseDN = ouPath + "," + l.BaseDN
	}
	result := &SearchResult{}

	if _, ok := l.pagingControls[ouPath]; !ok {
		l.pagingControls[ouPath] = ldap.NewControlPaging(PAGE_SIZE)
	}
	now := time.Now()

	// Create a search request that only looks one level deep
	searchRequest := ldap.NewSearchRequest(
		searchBaseDN,          // The base DN with optional OU path prepended
		ldap.ScopeSingleLevel, // Only look at immediate children
		ldap.NeverDerefAliases,
		0, 0, false,
		"(objectClass=*)", // Match all objects
		[]string{},        // Return all attributes
		[]ldap.Control{l.pagingControls[ouPath]},
	)

	sr, err := l.conn.Search(searchRequest)
	slog.Info("searching")
	if err != nil {
		slog.Info("end one layer search", "searchBaseDN", searchBaseDN, "duration", time.Since(now))
		slog.Error("Error searching layer", "error", err, "searchBaseDN", searchBaseDN)
		return nil, err
	}
	updatedControl := ldap.FindControl(sr.Controls, ldap.ControlTypePaging)
	if ctrl, ok := updatedControl.(*ldap.ControlPaging); ctrl != nil && ok && len(ctrl.Cookie) != 0 {
		l.pagingControls[ouPath].SetCookie(ctrl.Cookie)
		result.HasMore = true
	} else {
		l.pagingControls[ouPath].SetCookie(nil)
	}

	// Create a new tree with the search base DN as root
	t := tree.NewTree(searchBaseDN)

	// Add each entry to the tree
	for _, entry := range sr.Entries {
		m := make(map[string][]string)
		for _, attr := range entry.Attributes {
			m[attr.Name] = attr.Values
		}
		t.AddEntry(&tree.LDAPEntry{
			DN:    entry.DN,
			Attrs: m,
		})
	}
	result.Tree = t

	slog.Info("end one layer search", "searchBaseDN", searchBaseDN, "duration", time.Since(now), "entries", len(sr.Entries))
	return result, nil
}

func (l *LdapConn) GetEntries() *tree.Tree {
	slog.Info("begin get entries")
	now := time.Now()
	searchRequest := ldap.NewSearchRequest(
		l.BaseDN, // The base dn to search
		ldap.ScopeSingleLevel, ldap.NeverDerefAliases, 0, 0, false,
		"((objectClass=*))", // The filter to apply
		[]string{},
		nil,
	)

	sr, err := l.conn.Search(searchRequest)
	if err != nil {
		log.Fatal(err)
	}

	t := tree.NewTree(l.BaseDN)

	for _, entry := range sr.Entries {
		m := make(map[string][]string)
		for _, attr := range entry.Attributes {
			m[attr.Name] = attr.Values
		}
		t.AddEntry(&tree.LDAPEntry{
			DN:    entry.DN,
			Attrs: m,
		})
	}

	slog.Info("end get entries", "duration", time.Since(now))

	return t
}
