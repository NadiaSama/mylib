package memmysql

import (
	"fmt"
	"net"

	sqle "github.com/dolthub/go-mysql-server"
	"github.com/dolthub/go-mysql-server/memory"
	"github.com/dolthub/go-mysql-server/server"
	"github.com/dolthub/go-mysql-server/sql"
	"github.com/dolthub/go-mysql-server/sql/information_schema"
	"github.com/pkg/errors"
)

var (
	srv *server.Server
)

// Run start a go-mysql-server instance in background and return
// the dsn which used to connect to the server
func Run(dsn *string) error {
	dbName := "test"
	db := memory.NewDatabase(dbName)
	engine := sqle.NewDefault(sql.NewDatabaseProvider(
		db,
		information_schema.NewInformationSchemaDatabase(),
	))

	port, err := getFreePort()
	if err != nil {
		return errors.WithMessage(err, "get free port fail")
	}

	config := server.Config{
		Protocol: "tcp",
		Address:  fmt.Sprintf("localhost:%d", port),
	}

	s, err := server.NewDefaultServer(config, engine)
	if err != nil {
		return errors.WithMessage(err, "create server fail")
	}

	addr := fmt.Sprintf("root@tcp(localhost:%d)/%s?parseTime=true&loc=Asia%%2FShanghai", port, dbName)
	*dsn = addr
	srv = s
	go s.Start()
	return nil
}

// Close stop background server instance
func Close() error {
	return srv.Close()
}

func getFreePort() (int, error) {
	addr, err := net.ResolveTCPAddr("tcp", "localhost:0")
	if err != nil {
		return 0, errors.WithMessage(err, "resolve tcp addr fail")
	}

	l, err := net.ListenTCP("tcp", addr)
	if err != nil {
		return 0, errors.WithMessage(err, "listen fail")
	}
	defer l.Close()

	return l.Addr().(*net.TCPAddr).Port, nil

}
