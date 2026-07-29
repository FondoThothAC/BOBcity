package db

import (
	"database/sql"
	"fmt"
	"log"
)

// DriverType define el motor de base de datos objetivo.
type DriverType string

const (
	DriverMariaDB DriverType = "mariadb"
	DriverSQLite  DriverType = "sqlite3"
)

// DBConnector administra la conexión agnóstica para VPS (MariaDB) o Local (SQLite).
type DBConnector struct {
	Driver DriverType
	Conn   *sql.DB
}

// NewDBConnector crea e inicializa el pool de conexiones sin fuga de recursos.
func NewDBConnector(driver DriverType, dsn string) (*DBConnector, error) {
	log.Printf("[DBConnector] Inicializando conexión con driver: %s", driver)
	
	// En un entorno de producción, sql.Open se conecta al driver registrado
	conn, err := sql.Open(string(driver), dsn)
	if err != nil {
		return nil, fmt.Errorf("error al abrir la base de datos: %w", err)
	}

	// Optimización de pool de conexiones para alta concurrencia
	conn.SetMaxOpenConns(50)
	conn.SetMaxIdleConns(10)

	return &DBConnector{
		Driver: driver,
		Conn:   conn,
	}, nil
}

// Close cierra limpiamente las conexiones a la base de datos.
func (c *DBConnector) Close() error {
	if c.Conn != nil {
		return c.Conn.Close()
	}
	return nil
}
