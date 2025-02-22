package enums

type EventType string

type EventTypeBind struct {
	Value  EventType
	TSName string
}

const ConnectedEvent = "connected"
const DisconnectedEvent = "disconnected"

var (
	Connected = EventTypeBind{
		Value:  ConnectedEvent,
		TSName: "CONNECTED",
	}
	Disconnected = EventTypeBind{
		Value:  DisconnectedEvent,
		TSName: "DISCONNECTED",
	}
)
