// package memredis
package memredis

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/alicebob/miniredis/v2"
	"github.com/pkg/errors"
)

type (
	// Config return by Run method. used to connect miniredis server
	Config struct {
		Host string
		Port int
	}
)

// Run start a miniredis server in background and return corresponding address (host:port)
// which used to connect to the server
func Run() (*Config, error) {
	rds, err := miniredis.Run()
	if err != nil {
		return nil, errors.WithMessage(err, "create miniredis instance fail")
	}

	addr := rds.Addr()
	fields := strings.Split(addr, ":")
	if len(fields) != 2 {
		return nil, errors.Errorf("invalid addr='%s'", addr)
	}

	p, err := strconv.Atoi(fields[1])
	if err != nil {
		return nil, errors.WithMessage(err, "invalid port")
	}

	return &Config{
		Host: fields[0],
		Port: p,
	}, nil
}

func (rc *Config) Addr() string {
	return fmt.Sprintf("%s:%d", rc.Host, rc.Port)
}
