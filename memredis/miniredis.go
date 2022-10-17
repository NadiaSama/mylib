// package memredis
package memredis

import (
	"strconv"
	"strings"

	"github.com/alicebob/miniredis/v2"
	"github.com/pkg/errors"
)

type (
	RedisConfig struct {
		Addr string
	}
)

// Run start a miniredis server in background and return corresponding address
// which used to connect to the server
func Run(addr *string) error {
	rds, err := miniredis.Run()
	if err != nil {
		return errors.WithMessage(err, "create miniredis instance fail")
	}

	*addr = rds.Addr()
	return nil
}

// RunGetHostPort like Run but return host, port seperately
func RunGetHostPort(host *string, port *int) error {
	var addr string
	if err := Run(&addr); err != nil {
		return errors.WithMessage(err, "run error")
	}

	fields := strings.Split(addr, ":")
	if len(fields) != 2 {
		return errors.Errorf("invalid addr='%s'", addr)
	}

	p, err := strconv.Atoi(fields[1])
	if err != nil {
		return errors.WithMessage(err, "invalid port")
	}

	*port = p
	*host = fields[0]
	return nil
}
