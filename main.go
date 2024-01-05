// main.go

package main

import (
	"github.com/priyanshu360/NoteLink/config"
	"github.com/priyanshu360/NoteLink/server"
)

func main() {
	sCfg := config.NewServerConfig()
	server.StartHttpServer(sCfg)
}
