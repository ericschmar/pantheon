package tree

import (
	"fmt"
	"sort"
	"strings"
)

type LDAPEntry struct {
	DN    string              `json:"dn"`
	Attrs map[string][]string `json:"attrs"`
}

// TreeNode represents a node in the tree
type TreeNode struct {
	Id       string      `json:"id"`
	Entry    *LDAPEntry  `json:"entry"`
	Children []*TreeNode `json:"children"`
}

// NewTreeNode creates a new tree node
func NewTreeNode(entry *LDAPEntry) *TreeNode {
	if entry == nil {
		return &TreeNode{
			Children: make([]*TreeNode, 0),
		}
	}
	return &TreeNode{
		Id:       entry.DN,
		Entry:    entry,
		Children: make([]*TreeNode, 0),
	}
}

// Tree represents the LDAP tree
type Tree struct {
	Root *TreeNode
}

// NewTree creates a new empty tree
func NewTree(baseDN string) *Tree {
	baseEntry := &LDAPEntry{DN: baseDN}
	return &Tree{
		Root: NewTreeNode(baseEntry),
	}
}

// AddEntry adds an LDAP entry to the tree
func (t *Tree) AddEntry(entry *LDAPEntry) {
	parts := strings.Split(entry.DN, ",")
	node := t.Root

	// Check if the entry is under the base DN
	if !strings.HasSuffix(entry.DN, t.Root.Id) {
		fmt.Printf("Entry DN %s is not under the base DN %s\n", entry.DN, t.Root.Id)
		return
	}

	// Remove the base DN part from the entry DN parts
	parts = parts[:len(parts)-len(strings.Split(t.Root.Id, ","))]

	for i := len(parts) - 1; i >= 0; i-- {
		part := parts[i]
		found := false
		for _, child := range node.Children {
			if child.Id == part {
				node = child
				found = true
				break
			}
		}
		if !found {
			newNode := NewTreeNode(&LDAPEntry{DN: part})
			node.Children = append(node.Children, newNode)
			sortChildren(node.Children)
			node = newNode
		}
	}
	node.Entry = entry
}

func sortChildren(children []*TreeNode) {
	sort.Slice(children, func(i, j int) bool {
		return compareEntries(children[i], children[j])
	})
}

func compareEntries(a, b *TreeNode) bool {
	order := map[string]int{"dc": 1, "ou": 2, "uid": 3}
	aType := strings.Split(a.Id, "=")[0]
	bType := strings.Split(b.Id, "=")[0]

	// If both are 'ou', place the one with children above the one without children
	if aType == "ou" && bType == "ou" {
		if len(a.Children) != len(b.Children) {
			return len(a.Children) > len(b.Children)
		}
	}

	// If both are of the same type, sort alphabetically
	if order[aType] == order[bType] {
		return a.Id < b.Id
	}

	return order[aType] < order[bType]
}

// Print prints the tree structure
func (t *Tree) Print() {
	t.printNode(t.Root, 0)
}

func (t *Tree) printNode(node *TreeNode, level int) {
	if node.Entry != nil {
		fmt.Printf("%s%s\n", strings.Repeat("  ", level), node.Entry.DN)
	}
	for _, child := range node.Children {
		t.printNode(child, level+1)
	}
}
