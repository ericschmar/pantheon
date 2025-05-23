package services

import (
	"errors"
	"fmt"
	"ldap-explorer-go/tree"
	"log"
	"log/slog"
	"time"

	"github.com/go-ldap/ldap/v3"
)

type Option = func(*LdapConn)

type LdapConn struct {
	conn        *ldap.Conn `json:"-"`
	isConnected bool       `json:"-"`
	closeChan   chan bool  `json:"-"`
	Key         string     `json:"key"`
	Host        string     `json:"host"`
	Port        string     `json:"port"`
	Username    string     `json:"username"`
	Password    string     `json:"password"`
	Name        string     `json:"name"`
	BaseDN      string     `json:"base_dn"`
	IsFavorited bool       `json:"is_favorited"`
	UseTls      bool       `json:"use_tls"`
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

	conn, err := ldap.DialURL(fmt.Sprintf("%s://%s:%s", protocol, l.Host, l.Port))
	if err != nil {
		return err
	}
	conn.Bind(l.Username, l.Password)
	l.conn = conn
	l.isConnected = true
	go l.backgroundConnectionPoll()
	return nil
}

func (l *LdapConn) backgroundConnectionPoll() {
	slog.Info("starting background connection poll")
	for {
		time.Sleep(500 * time.Millisecond)
		select {
		case <-l.closeChan:
			slog.Info("returning from backgroundConnectionPoll")
			return
		default:
			if l.conn.IsClosing() {
				slog.Info("connection is closing")
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

func (l *LdapConn) Search(search string) (*tree.Tree, error) {
	searchRequest := ldap.NewSearchRequest(
		l.BaseDN, // The base dn to search
		ldap.ScopeWholeSubtree, ldap.NeverDerefAliases, 0, 0, false,
		search,        // The filter to apply
		[]string{"*"}, // A list attributes to retrieve
		nil,
	)

	sr, err := l.conn.Search(searchRequest)
	if err != nil {
		return nil, err
	}

	t := tree.NewTree(l.BaseDN)

	for _, entry := range sr.Entries[1:] {
		m := make(map[string][]string)
		for _, attr := range entry.Attributes {
			m[attr.Name] = attr.Values
		}
		t.AddEntry(&tree.LDAPEntry{
			DN:    entry.DN,
			Attrs: m,
		})
	}

	return t, nil
}

func (l *LdapConn) GetEntries() *tree.Tree {
	searchRequest := ldap.NewSearchRequest(
		l.BaseDN, // The base dn to search
		ldap.ScopeWholeSubtree, ldap.NeverDerefAliases, 0, 0, false,
		"((objectClass=*))", // The filter to apply
		[]string{"*"},       // A list attributes to retrieve
		nil,
	)

	sr, err := l.conn.Search(searchRequest)
	if err != nil {
		log.Fatal(err)
	}

	t := tree.NewTree(l.BaseDN)

	for _, entry := range sr.Entries[1:] {
		m := make(map[string][]string)
		for _, attr := range entry.Attributes {
			m[attr.Name] = attr.Values
		}
		t.AddEntry(&tree.LDAPEntry{
			DN:    entry.DN,
			Attrs: m,
		})
	}

	return t
}
