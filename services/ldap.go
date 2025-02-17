package services

import (
	"fmt"
	"ldap-explorer-go/tree"
	"log"

	"github.com/go-ldap/ldap/v3"
)

type Option = func(*LdapConn)

type LdapConn struct {
	conn     *ldap.Conn
	host     string
	port     string
	username string
	password string
}

func NewLdapConn(opts ...Option) (*LdapConn, error) {
	l := &LdapConn{}
	for _, opt := range opts {
		opt(l)
	}
	conn, err := ldap.DialURL(fmt.Sprintf("ldap://%s:%s", l.host, l.port))
	if err != nil {
		return nil, err
	}
	conn.Bind(l.username, l.password)
	l.conn = conn
	return l, nil
}

func WithHost(host string) Option {
	return func(l *LdapConn) {
		l.host = host
	}
}

func WithPort(port string) Option {
	return func(l *LdapConn) {
		l.port = port
	}
}

func WithUsername(username string) Option {
	return func(l *LdapConn) {
		l.username = username
	}
}

func WithPassword(password string) Option {
	return func(l *LdapConn) {
		l.password = password
	}
}

func (l *LdapConn) GetEntries() *tree.Tree {
	BASE_DN := "dc=example,dc=com"
	searchRequest := ldap.NewSearchRequest(
		BASE_DN, // The base dn to search
		ldap.ScopeWholeSubtree, ldap.NeverDerefAliases, 0, 0, false,
		"((objectClass=*))", // The filter to apply
		[]string{"*"},       // A list attributes to retrieve
		nil,
	)

	sr, err := l.conn.Search(searchRequest)
	if err != nil {
		log.Fatal(err)
	}

	t := tree.NewTree(BASE_DN)

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
