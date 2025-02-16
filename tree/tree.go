package tree

import (
	"fmt"
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
func NewTree() *Tree {
	return &Tree{
		Root: NewTreeNode(nil),
	}
}

// AddEntry adds an LDAP entry to the tree
func (t *Tree) AddEntry(entry *LDAPEntry) {
	parts := strings.Split(entry.DN, ",")
	node := t.Root
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
			node = newNode
		}
	}
	node.Entry = entry
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
