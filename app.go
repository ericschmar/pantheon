package main

import (
	"context"
	"encoding/json"
	"ldap-explorer-go/enums"
	"ldap-explorer-go/services"
	"ldap-explorer-go/tree"
	"log/slog"
	"runtime"

	keyring "github.com/99designs/keyring"
	gd "github.com/ginkgoch/godash/v2"
	shortuuid "github.com/lithammer/shortuuid/v4"
	rt "github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx         context.Context
	ls          *services.LdapConn
	kr          keyring.Keyring
	isConnected bool
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called at application startup
func (a *App) startup(ctx context.Context) {
	// Perform your setup here
	a.ctx = ctx
	//logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{AddSource: true}))
	//slog.SetDefault(logger)
	if runtime.GOOS == "darwin" { // macos
		if kr, err := keyring.Open(keyring.Config{
			ServiceName:              "Pantheon",
			KeychainName:             "Pantheon",
			KeychainTrustApplication: true,
			KeychainSynchronizable:   false,
			KeychainPasswordFunc:     func(string) (string, error) { return "", nil },
		}); err != nil {
			slog.Error("Failed to open keyring", "err", err)
			return
		} else {
			a.kr = kr
		}
	}
}

// domReady is called after front-end resources have been loaded
func (a App) domReady(ctx context.Context) {
	// Add your action here
}

// beforeClose is called when the application is about to quit,
// either by clicking the window close button or calling runtime.Quit.
// Returning true will cause the application to continue, false will continue shutdown as normal.
func (a *App) beforeClose(ctx context.Context) (prevent bool) {
	return false
}

// shutdown is called at application termination
func (a *App) shutdown(ctx context.Context) {
	if err := a.ls.Disconnect(); err != nil {
		slog.Error("Failed to disconnect from LDAP server", "err", err)
	}
	// Perform your teardown here
}

func (a *App) Search(search string) (*tree.Tree, error) {
	return a.ls.Search(search)
}

func (a *App) SearchOneLayer(search string) (*tree.Tree, error) {
	return a.ls.SearchOneLayer(search)
}

func (a *App) GetEntries() *tree.Tree {
	return a.ls.GetEntries()
}

func (a *App) AddCredential(conn *services.LdapConn) error {
	jsonBytes, err := json.Marshal(conn)
	if err != nil {
		return err
	}
	return a.kr.Set(keyring.Item{
		Key:   shortuuid.New(),
		Data:  jsonBytes,
		Label: conn.Host,
	})
}

func (a *App) DeleteCredential(key string) error {
	return a.kr.Remove(key)
}

func (a *App) GetCredentials() []*services.LdapConn {
	items, _ := a.kr.Keys()
	return gd.Map(items, func(key string) *services.LdapConn {
		item, _ := a.kr.Get(key)
		var i services.LdapConn
		if err := json.Unmarshal(item.Data, &i); err != nil {
			return nil
		}
		ld, _ := services.NewLdapConn(services.WithHost(i.Host), services.WithPort(i.Port), services.WithName(i.Name))
		ld.Key = key
		return ld
	})
}

func (a *App) Disconnect() error {
	if a.ls != nil {
		return a.ls.Disconnect()
	}
	return nil
}

func (a *App) TestConnection(conn *services.LdapConn) string {
	if err := a.connect(conn); err != "" {
		return err
	}
	a.ls.Disconnect()
	return ""
}

func (a *App) Connect(conn *services.LdapConn) string {
    slog.Info("connecting to ldap server", "conn", conn)
	jsonBytes, err := json.Marshal(conn)
	if err != nil {
		return err.Error()
	}
	if c, err := a.kr.Get(conn.Key); err != nil {
		if conn.IsFavorited {
			a.kr.Set(keyring.Item{
				Key:   shortuuid.New(),
				Data:  jsonBytes,
				Label: conn.Host,
			})
		}
		return a.connect(conn)
	} else {
		var i services.LdapConn
		if err := json.Unmarshal(c.Data, &i); err != nil {
			return err.Error()
		}
		return a.connect(&i)
	}
}

func (a *App) connect(conn *services.LdapConn) string {
    slog.Info("connecting to ldap server", "conn", conn)
	if ls, err := services.NewLdapConn(services.WithHost(conn.Host),
		services.WithUsername(conn.Username),
		services.WithPassword(conn.Password),
		services.WithPort(conn.Port),
		services.WithName(conn.Name),
		services.WithBaseDN(conn.BaseDN),
		services.WithUseTls(conn.UseTls),
		services.WithKey(conn.Key)); err != nil {
		return err.Error()
	} else {
		a.ls = ls
		if err := a.ls.Connect(); err != nil {
		slog.Error("error", "err", err)
			return err.Error()
		}
		a.isConnected = true
		rt.EventsEmit(a.ctx, enums.ConnectedEvent, "")
		return ""
	}
}
