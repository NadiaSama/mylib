package memmysql

import (
	"fmt"
	"net"
	"net/url"

	sqle "github.com/dolthub/go-mysql-server"
	"github.com/dolthub/go-mysql-server/memory"
	"github.com/dolthub/go-mysql-server/server"
	"github.com/dolthub/go-mysql-server/sql"
	"github.com/dolthub/go-mysql-server/sql/information_schema"
	"github.com/pkg/errors"
)

type (
	// Config return by Run method. used to connect go-mysql-server
	Config struct {
		Host   string
		Port   int
		User   string
		Passwd string
		DB     string
	}
)

var (
	srv *server.Server
)

// Run start a go-mysql-server instance in background and return
// corresponding config which used to connect to the server
func Run() (*Config, error) {
	dbName := "test"
	db := memory.NewDatabase(dbName)
	engine := sqle.NewDefault(sql.NewDatabaseProvider(
		db,
		information_schema.NewInformationSchemaDatabase(),
	))

	port, err := getFreePort()
	if err != nil {
		return nil, errors.WithMessage(err, "get free port fail")
	}

	config := server.Config{
		Protocol: "tcp",
		Address:  fmt.Sprintf("localhost:%d", port),
	}

	s, err := server.NewDefaultServer(config, engine)
	if err != nil {
		return nil, errors.WithMessage(err, "create server fail")
	}

	srv = s
	go s.Start()
	return &Config{
		Host:   "localhost",
		Port:   port,
		User:   "root",
		Passwd: "",
		DB:     dbName,
	}, nil
}

// DSN build data source name according config property and params if specfic
func (c *Config) DSN(params url.Values) string {
	var (
		ret string
	)

	if len(c.Passwd) == 0 {
		ret = fmt.Sprintf("%s@tcp(%s:%d)/%s", c.User, c.Host, c.Port, c.DB)
	} else {
		ret = fmt.Sprintf("%s:%s@tcp(%s:%d)/%s", c.User, c.Passwd, c.Host, c.Port, c.DB)
	}

	if len(params) != 0 {
		ret = fmt.Sprintf("%s?%s", ret, params.Encode())
	}
	return ret
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
