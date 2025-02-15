package tree

import (
	"encoding/json"
	"strings"
)

type Tree[P PayloadType] struct {
	Root *Node[P]
	Refs map[string]*Node[P]
}

func New[P PayloadType]() *Tree[P] {
	items := make([]*Node[P], 0)
	rootNode := &Node[P]{
		Nodes: &items,
	}
	refs := make(map[string]*Node[P])
	refs[""] = rootNode

	return &Tree[P]{
		Root: rootNode,
		Refs: refs,
	}
}

func (t *Tree[P]) AddNode(path []string, payload P) {
	if len(path) > 0 {
		pathParts := make([]string, 0)

		for index, pathElement := range path {
			pathParts = append(pathParts, pathElement)
			parentPath := path[:len(pathParts)-1]
			pathKey := strings.Join(pathParts, ".")
			parentPathKey := strings.Join(parentPath, ".")

			if _, ok := t.Refs[pathKey]; !ok {
				items := make([]*Node[P], 0)
				newNode := Node[P]{
					Name:  pathElement,
					Nodes: &items,
				}

				if index == len(path)-1 {
					// it's a leaf, adding payload there
					newNode.Payload = payload
				}

				toNode := t.Refs[parentPathKey]
				toNodeNodesDeref := *toNode.Nodes
				toNodeNodesDeref = append(toNodeNodesDeref, &newNode)
				toNode.Nodes = &toNodeNodesDeref

				t.Refs[pathKey] = &newNode
			}
		}
	}
}

func (t *Tree[P]) ToJSON() string {
	jsonData, _ := json.MarshalIndent(t.Root, "", "  ")
	return string(jsonData)
}
