// Package ws implementa un hub WebSocket para streaming en tiempo real de logs OSINT.
package ws

import (
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/gofiber/contrib/websocket"
)

// LogMessage representa un mensaje de log en tiempo real
type LogMessage struct {
	Type      string `json:"type"`
	Tool      string `json:"tool"`
	Level     string `json:"level"`
	Message   string `json:"message"`
	Timestamp string `json:"timestamp"`
}

// Client representa un cliente WebSocket conectado
type Client struct {
	conn *websocket.Conn
	send chan LogMessage
}

// Hub gestiona todas las conexiones WebSocket activas
type Hub struct {
	clients    map[*Client]bool
	broadcast  chan LogMessage
	register   chan *Client
	unregister chan *Client
	mu         sync.RWMutex
}

// NewHub crea una nueva instancia del hub WebSocket
func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan LogMessage, 256),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

// Run inicia el loop principal del hub
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
			log.Printf("[WS] Cliente conectado: %d clientes activos", len(h.clients))

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
			h.mu.Unlock()
			log.Printf("[WS] Cliente desconectado: %d clientes activos", len(h.clients))

		case message := <-h.broadcast:
			h.mu.RLock()
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
			h.mu.RUnlock()
		}
	}
}

// BroadcastLog envía un mensaje de log a todos los clientes conectados
func (h *Hub) BroadcastLog(tool, level, message string) {
	msg := LogMessage{
		Type:      "log",
		Tool:      tool,
		Level:     level,
		Message:   message,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	}
	select {
	case h.broadcast <- msg:
	default:
		log.Printf("[WS] Buffer lleno, descartando mensaje de %s", tool)
	}
}

// BroadcastScanComplete envía notificación de escaneo completado
func (h *Hub) BroadcastScanComplete(target string, matchesCount int, durationMs float64) {
	msg := LogMessage{
		Type:      "scan_complete",
		Tool:      "engine",
		Level:     "info",
		Message:   fmt.Sprintf("Escaneo completado: %d coincidencias en %.1fms", matchesCount, durationMs),
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	}
	select {
	case h.broadcast <- msg:
	default:
	}
}

// GetClientCount retorna el número de clientes conectados
func (h *Hub) GetClientCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}

// LogCallback retorna una función callback compatible con EngineWithLogs
func (h *Hub) LogCallback() func(tool, level, message string) {
	return func(tool, level, message string) {
		h.BroadcastLog(tool, level, message)
	}
}

// HandleWebSocket maneja las conexiones WebSocket entrantes
func HandleWebSocket(hub *Hub) func(c *websocket.Conn) {
	return func(c *websocket.Conn) {
		client := &Client{
			conn: c,
			send: make(chan LogMessage, 256),
		}
		hub.register <- client

		// Goroutine para enviar mensajes al cliente
		go func() {
			defer c.Close()
			for msg := range client.send {
				data, err := json.Marshal(msg)
				if err != nil {
					continue
				}
				if err := c.WriteMessage(websocket.TextMessage, data); err != nil {
					break
				}
			}
		}()

		// Leer mensajes del cliente (para ping/pong o comandos)
		defer func() {
			hub.unregister <- client
			c.Close()
		}()
		for {
			_, _, err := c.ReadMessage()
			if err != nil {
				break
			}
		}
	}
}
