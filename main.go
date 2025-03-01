package main

import (
	"embed"
	"ldap-explorer-go/enums"
	"log"
	"runtime"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/logger"
	"github.com/wailsapp/wails/v2/pkg/menu"
	"github.com/wailsapp/wails/v2/pkg/menu/keys"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
	rt "github.com/wailsapp/wails/v2/pkg/runtime"
)

//go:embed frontend/build
var assets embed.FS

//go:embed build/appicon.png
var icon []byte

func main() {
	// Create an instance of the app structure
	app := NewApp()

	AppMenu := menu.NewMenu()
	if runtime.GOOS == "darwin" {
		AppMenu.Append(menu.AppMenu()) // On macOS platform, this must be done right after `NewMenu()`
	}
	FileMenu := AppMenu.AddSubmenu("File")

	FileMenu.AddText("Quit", keys.CmdOrCtrl("q"), func(_ *menu.CallbackData) {
		rt.Quit(app.ctx)
	})

	if runtime.GOOS == "darwin" {
		AppMenu.Append(menu.EditMenu()) // On macOS platform, EditMenu should be appended to enable Cmd+C, Cmd+V, Cmd+Z... shortcuts
	}

	// Create application with options
	err := wails.Run(&options.App{
		Title:             "Pantheon",
		Width:             1024,
		Height:            768,
		MinWidth:          400,
		MinHeight:         400,
		DisableResize:     false,
		Fullscreen:        false,
		Frameless:         runtime.GOOS != "darwin",
		StartHidden:       false,
		HideWindowOnClose: false,
		BackgroundColour:  &options.RGBA{R: 255, G: 255, B: 255, A: 255},
		AssetServer: &assetserver.Options{
			Assets:     assets,
			Handler:    nil,
			Middleware: nil,
		},
		Menu:             AppMenu,
		Logger:           logger.NewFileLogger("log"),
		OnStartup:        app.startup,
		OnDomReady:       app.domReady,
		OnBeforeClose:    app.beforeClose,
		OnShutdown:       app.shutdown,
		WindowStartState: options.Normal,
		CSSDragProperty:  "--wails-draggable",
		CSSDragValue:     "drag",
		Bind: []interface{}{
			app,
		},
		EnumBind: []interface{}{
			[]enums.EventTypeBind{enums.Connected, enums.Disconnected},
		},
		// Windows platform specific options
		// Windows: &windows.Options{
		// 	WebviewIsTransparent: true,
		// 	WindowIsTranslucent:  true,
		// 	DisableWindowIcon:    true,
		// 	// DisableFramelessWindowDecorations: false,
		// 	WebviewUserDataPath: "",
		// 	BackdropType:        windows.Acrylic,
		// },
		// Mac platform specific options
		Mac: &mac.Options{
			About: &mac.AboutInfo{
				Title: "Pantheon",
				Icon:  icon,
			},
			TitleBar: &mac.TitleBar{
				TitlebarAppearsTransparent: true,
				HideTitle:                  false,
				HideTitleBar:               false,
				FullSizeContent:            false,
				UseToolbar:                 false,
				HideToolbarSeparator:       true,
			},
			Appearance:           mac.NSAppearanceNameDarkAqua,
			WebviewIsTransparent: true,
			WindowIsTranslucent:  false,
		},
	})

	if err != nil {
		log.Println(err)
		log.Fatal(err)
	}
}
