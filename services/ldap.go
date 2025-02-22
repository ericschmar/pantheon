package services

import (
	"fmt"
	"ldap-explorer-go/tree"
	"log"

	"github.com/go-ldap/ldap/v3"
)

type Option = func(*LdapConn)

type LdapConn struct {
	conn        *ldap.Conn `json:"-"`
	Key         string     `json:"key"`
	Host        string     `json:"host"`
	Port        string     `json:"port"`
	Username    string     `json:"username"`
	Password    string     `json:"password"`
	Name        string     `json:"name"`
	BaseDN      string     `json:"base_dn"`
	IsFavorited bool       `json:"is_favorited"`
}

func NewLdapConn(opts ...Option) (*LdapConn, error) {
	l := &LdapConn{}
	for _, opt := range opts {
		opt(l)
	}
	return l, nil
}

func (l *LdapConn) Connect() error {
	conn, err := ldap.DialURL(fmt.Sprintf("ldap://%s:%s", l.Host, l.Port))
	if err != nil {
		return err
	}
	conn.Bind(l.Username, l.Password)
	l.conn = conn
	return nil
}

func (l *LdapConn) Disconnect() error {
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
