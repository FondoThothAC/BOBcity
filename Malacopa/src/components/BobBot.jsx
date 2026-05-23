/* ============================================================================
   Malacopa - Asistente Virtual IA "Bob Bot" (React)
   ============================================================================
   Asistente virtual de entretenimiento y logística de shows.
   Utiliza la API de Gemini 1.5 Flash si está configurada,
   o el motor local algorítmico de contingencia con respuestas en español.
   ============================================================================ */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Settings, AlertTriangle, Key } from 'lucide-react';

export default function BobBot() {
  const [mensajes, setMensajes] = useState([
    { id: 1, sender: 'bot', text: '¡Hola! Soy Bob Bot, tu asistente de producción en Malacopa. ¿En qué te ayudo hoy? Puedo ayudarte a armar setlists, explicar flujos NIF B-3 o revisar la agenda de tus músicos.' }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [apiKey, setApiKey] = useState(localStorage.getItem('malacopa_gemini_key') || '');
  const [showConfig, setShowConfig] = useState(false);
  const [cargando, setCargando] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  const guardarKey = (val) => {
    setApiKey(val);
    if (val.trim()) {
      localStorage.setItem('malacopa_gemini_key', val.trim());
    } else {
      localStorage.removeItem('malacopa_gemini_key');
    }
  };

  // Motor algorítmico de fallback
  const responderLocalmente = (pregunta) => {
    const p = pregunta.toLowerCase();
    
    if (p.includes('setlist') || p.includes('playlist') || p.includes('cancion') || p.includes('repertorio')) {
      return 'Para armar un buen setlist en Malacopa, ve al Dashboard del Artista (Nivel 4), ingresa a la pestaña "Playlist" y añade canciones con su tono y orden. Los músicos asignados podrán verlo en tiempo real en su panel Nivel 3.';
    }
    if (p.includes('nif') || p.includes('finanzas') || p.includes('ganancia') || p.includes('comision') || p.includes('contabil')) {
      return 'Bajo NIF B-3 (Estado de Resultados), restamos el costo de shows y comisiones del manager para dar la Utilidad Neta. En NIF B-2 (Flujo de Efectivo), los cobros son actividades de Operación, las compras de instrumentos/audio son Inversión, y los pagos de financiamiento son Financiamiento.';
    }
    if (p.includes('musico') || p.includes('colaborador') || p.includes('banda') || p.includes('integrante')) {
      return 'En Malacopa puedes registrar músicos colaboradores en el Dashboard del Artista. Al agregarlos a un show, ellos verán el mapa interactivo del lugar de presentación (Leaflet) y el repertorio específico de ese evento.';
    }
    if (p.includes('adeem') || p.includes('empresario') || p.includes('asociacion')) {
      return 'ADEEM (Asociación de Empresarios del Entretenimiento de México) es nuestro marco de referencia institucional. La app te ayuda a generar reportes bajo sus lineamientos de contratos de espectáculos.';
    }
    if (p.includes('ticket') || p.includes('boleto') || p.includes('comprar')) {
      return 'Los fans pueden comprar boletos en la cartelera interactiva. Al pagar con PayPal, se genera un ticket digital y se envía un mensaje de confirmación por WhatsApp al manager.';
    }
    
    return 'Entiendo. Como tu asistente de producción en Malacopa, te sugiero coordinar con tu manager o revisar los setlists del evento. ¿Deseas que armemos un presupuesto o una playlist de rock para el show?';
  };

  const enviarPregunta = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg;
    setInputMsg('');
    setMensajes((prev) => [...prev, { id: Date.now(), sender: 'user', text: userText }]);
    setCargando(true);

    // Si tiene API Key de Gemini configurada
    if (apiKey.trim()) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Eres Bob Bot, un asistente inteligente de producción y logística de eventos en la aplicación "Malacopa".
                 Ayudas a músicos, managers y contratantes. Tu tono es profesional, divertido, rockero y experto en entretenimiento.
                 Siempre responde en español de manera corta y concisa.
                 Pregunta del usuario: ${userText}`
              }]
            }]
          })
        });
        
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || responderLocalmente(userText);
        setMensajes((prev) => [...prev, { id: Date.now() + 1, sender: 'bot', text }]);
      } catch (err) {
        console.error('Error al consultar la API de Gemini:', err);
        setMensajes((prev) => [...prev, { 
          id: Date.now() + 1, 
          sender: 'bot', 
          text: responderLocalmente(userText) + ' (Nota: Ocurrió un error con la API, usando motor de contingencia local)' 
        }]);
      }
    } else {
      // Fallback local instantáneo
      setTimeout(() => {
        setMensajes((prev) => [...prev, { id: Date.now() + 1, sender: 'bot', text: responderLocalmente(userText) }]);
      }, 600);
    }
    setCargando(false);
  };

  return (
    <div className="tarjeta-premium chat-container" style={{ flex: 1, padding: 0 }}>
      {/* Cabecera del Chat */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--color-borde-glass)',
        display: 'flex',
        justifyContent: 'between',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Bot size={20} color="var(--color-neon-magenta)" className="efecto-pulso" />
          <div>
            <h4 style={{ margin: 0, fontSize: '15px' }}>Bob Bot Asistente IA</h4>
            <span style={{ fontSize: '11px', color: apiKey ? 'var(--color-neon-cian)' : 'var(--color-texto-secundario)' }}>
              {apiKey ? 'Modo Gemini 1.5 Flash Activo' : 'Modo Fuera de Línea'}
            </span>
          </div>
        </div>
        <button 
          onClick={() => setShowConfig(!showConfig)}
          className="btn-secundario"
          style={{ padding: '6px', borderRadius: '50%' }}
          title="Configurar Gemini Key"
        >
          <Settings size={15} />
        </button>
      </div>

      {/* Panel de Configuración Gemini Key */}
      {showConfig && (
        <div style={{
          padding: '16px',
          background: 'rgba(138, 43, 226, 0.08)',
          borderBottom: '1px solid var(--color-borde-glass)',
          fontSize: '13px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: 'var(--color-neon-cian)' }}>
            <Key size={14} />
            <strong>Clave API de Google AI Studio (Gemini 1.5 Flash):</strong>
          </div>
          <input
            type="password"
            placeholder="Introduce tu clave API (AIzaSy...)"
            value={apiKey}
            onChange={(e) => guardarKey(e.target.value)}
            className="input-premium"
            style={{ padding: '8px 12px', fontSize: '13px', marginBottom: '8px' }}
          />
          <div style={{ fontSize: '11px', color: 'var(--color-texto-secundario)', lineHeight: '1.4' }}>
            Las llamadas se realizan directo desde tu navegador de forma gratuita. Tu clave se almacena localmente de forma segura. Si se deja vacía, se usará el motor de contingencia local.
          </div>
        </div>
      )}

      {/* Cuerpo del Chat */}
      <div className="chat-messages">
        {mensajes.map((m) => (
          <div key={m.id} className={`message-bubble ${m.sender === 'bot' ? 'received' : 'sent'}`}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px', fontSize: '11px', opacity: 0.7 }}>
              {m.sender === 'bot' ? <Bot size={12} /> : <User size={12} />}
              <span>{m.sender === 'bot' ? 'Bob Bot' : 'Tú'}</span>
            </div>
            <div>{m.text}</div>
          </div>
        ))}
        {cargando && (
          <div className="message-bubble received">
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className="cargador">⏳</span>
              <span style={{ fontSize: '13px' }}>Bob pensando...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de Envío */}
      <form onSubmit={enviarPregunta} className="chat-input-area">
        <input
          type="text"
          placeholder="Pregúntame sobre repertorios, shows, NIF B-3 o locales..."
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          className="input-premium"
          style={{ borderRadius: '24px', padding: '10px 16px' }}
        />
        <button type="submit" className="btn-neon" style={{ padding: '10px', borderRadius: '50%' }}>
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
