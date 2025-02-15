package map_tree

import "fmt"

/*
dc=com -> dc=example -> values

	|
	-> dc=example2 -> values
*/
type MapTree struct {
	Key    string
	Values map[string]any
}

func NewMapTree(key string) *MapTree {
	return &MapTree{
		Key:    key,
		Values: make(map[string]any),
	}
}

/*
dc=com -> dc=example -> values

	|
	-> dc=example2 -> values
*/
func (m *MapTree) Insert(key []string, value any) {
	if len(key) == 1 {
		//fmt.Println("Inserting value: ", key[0], value)
		m.Values[key[0]] = value
		return
	}
	//fmt.Println("Inserting value: ", key[0], key[1])
	m.Values[key[0]] = key[1]
	m.Insert(key[1:], value)
}

func (m *MapTree) Print() {
	for k, v := range m.Values {
		if s, ok := v.(string); ok {
			fmt.Printf("%s: %v\n", k, s)
			continue
		}
		fmt.Printf("%s: %v\n", k, v)
	}
}
