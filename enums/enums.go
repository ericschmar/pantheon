package enums

type EventType string

type EventTypeBind struct {
	Value  EventType
	TSName string
}

const ConnectedEvent = "connected"

var (
	Connected = EventTypeBind{
		Value:  ConnectedEvent,
		TSName: "CONNECTED",
	}
)
