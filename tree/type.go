package tree

type PayloadType interface {
	map[string]any
}

type Node[P PayloadType] struct {
	Name    string      `json:"name"`
	Nodes   *[]*Node[P] `json:"nodes"`
	Payload P           `json:"payload"`
}
