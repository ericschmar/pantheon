package services

import (
	"fmt"
	"ldap-explorer-go/tree"
	"log"

	"hash/fnv"

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

	t := tree.NewTree()

	//tree := map_tree.NewMapTree(BASE_DN)

	for idx, entry := range sr.Entries {
		m := make(map[string][]string)
		for _, attr := range entry.Attributes {
			m[attr.Name] = attr.Values
		}
		if idx == 0 {
			//t.AddNode(strings.Split(BASE_DN, ","), m)
			//fmt.Println(gd.Split(BASE_DN, ","))
		} else {
			//s, _ := strings.CutSuffix(entry.DN, BASE_DN)
			//fmt.Println(s)
			//t.AddNode(gd.Reverse(strings.Split(s, ",")), m)
			//tree.Insert(gd.Reverse(strings.Split(s, ",")), m)
			t.AddEntry(&tree.LDAPEntry{
				DN:    entry.DN,
				Attrs: m,
			})
		}
	}

	//t.Print()
	//fmt.Println(t.ToJSON())
	return t
}

func hash(s string) uint {
	h := fnv.New32a()
	h.Write([]byte(s))
	return uint(h.Sum32())
}
