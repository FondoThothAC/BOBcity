/* ============================================================================
   Malacopa - Dashboard del Cliente / Fan (React)
   ============================================================================
   Muestra el feed dinámico de shows, compra de boletos por zona
   (VIP/General), simulación de pago PayPal y solicitud de shows privados.
   ============================================================================ */

import React, { useState } from 'react';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';
import { Calendar, Ticket, Compass, CreditCard, CheckCircle, Music, Send, Star } from 'lucide-react';

const EVENTOS_MALACOPA = [
  {
    id: 'ev_1',
    artista: 'Fractos Show',
    titulo: 'Fractos Tour 2026',
    fecha: '2026-06-15',
    hora: '21:00',
    lugar: 'Foro del Sol, Hermosillo',
    precioVIP: 1200,
    precioGral: 450,
    imagen: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
    descripcion: 'Una experiencia audiovisual inmersiva de música electrónica y arte visual vanguardista.',
    rating: 4.9
  },
  {
    id: 'ev_2',
    artista: 'Grupo ADEEM Norteño',
    titulo: 'Gran Noche Mexicana',
    fecha: '2026-06-20',
    hora: '22:00',
    lugar: 'Palenque Hermosillo',
    precioVIP: 1500,
    precioGral: 500,
    imagen: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=600&q=80',
    descripcion: 'Lo mejor del regional mexicano en un concierto íntimo lleno de sorpresas y clásicos.',
    rating: 4.8
  },
  {
    id: 'ev_3',
    artista: 'Nu9ve Jazz Quintet',
    titulo: 'Noches de Improvisación y Sax',
    fecha: '2026-07-02',
    hora: '20:30',
    lugar: 'Bar Backstage, Hermosillo',
    precioVIP: 600,
    precioGral: 250,
    imagen: 'https://images.unsplash.com/photo-1486591978090-58e619d37fe7?auto=format&fit=crop&w=600&q=80',
    descripcion: 'Una noche de jazz contemporáneo con músicos invitados nacionales e internacionales.',
    rating: 4.7
  }
];

export default function ClientDashboard() {
  const { user } = useAuth();
  const { addToCart, cartItems, points, pointsDiscount, clearCart, agregarPuntos, canjearPuntos } = useCart();
  
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [zona, setZona] = useState('Gral');
  const [usarPuntos, setUsarPuntos] = useState(false);
  const [checkoutExitoso, setCheckoutExitoso] = useState(false);
  const [activeTab, setActiveTab] = useState('feed');
  const [ticketComprado, setTicketComprado] = useState(null);

  // Formulario de contratación
  const [nombreEvento, setNombreEvento] = useState('');
  const [artistaContratar, setArtistaContratar] = useState('Fractos Show');
  const [fechaEvento, setFechaEvento] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [cotizacionEnviada, setCotizacionEnviada] = useState(false);

  const handleComprarBoleto = (e) => {
    e.preventDefault();
    if (user.roleLevel < 2) {
      alert("Por favor inicia sesión como Cliente (Nivel 2) para realizar compras.");
      return;
    }

    const precioUnitario = zona === 'VIP' ? eventoSeleccionado.precioVIP : eventoSeleccionado.precioGral;
    const item = {
      id: eventoSeleccionado.id,
      titulo: eventoSeleccionado.titulo,
      artista: eventoSeleccionado.artista,
      fecha: eventoSeleccionado.fecha,
      lugar: eventoSeleccionado.lugar,
      zona: zona,
      precio: precioUnitario,
      cantidad: cantidad
    };

    addToCart(item);
    setEventoSeleccionado(null);
    setActiveTab('carrito');
  };

  const procesarCompraCarrito = (metodo = 'paypal') => {
    const total = cartItems.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    const descuento = usarPuntos ? pointsDiscount : 0;
    const finalTotal = Math.max(0, total - descuento);

    // Guardar para mostrar el boleto final
    setTicketComprado({
      items: cartItems,
      total: finalTotal,
      metodo: metodo,
      folio: `MC-${Math.floor(100000 + Math.random() * 900000)}`
    });

    agregarPuntos(finalTotal);
    if (usarPuntos) {
      canjearPuntos();
    }
    clearCart();
    setCheckoutExitoso(true);
    setUsarPuntos(false);
  };

  const handleCotizar = (e) => {
    e.preventDefault();
    if (!nombreEvento || !fechaEvento || !ubicacion) {
      alert("Por favor rellena todos los campos.");
      return;
    }

    // Agregar cotización simulada al localStorage para que el manager la vea
    const nuevaCotizacion = {
      id: `cot_${Date.now()}`,
      cliente: user.name,
      contacto: user.email,
      evento: nombreEvento,
      artista: artistaContratar,
      fecha: fechaEvento,
      lugar: ubicacion,
      estado: 'Pendiente',
      montoPropuesto: artistaContratar === 'Fractos Show' ? 35000 : artistaContratar === 'Grupo ADEEM Norteño' ? 50000 : 18000
    };

    try {
      const cotizacionesStored = JSON.parse(localStorage.getItem('malacopa_cotizaciones') || '[]');
      localStorage.setItem('malacopa_cotizaciones', JSON.stringify([...cotizacionesStored, nuevaCotizacion]));
    } catch (e) {
      console.error(e);
    }

    setCotizacionEnviada(true);
    setTimeout(() => {
      setCotizacionEnviada(false);
      setNombreEvento('');
      setFechaEvento('');
      setUbicacion('');
    }, 4000);
  };

  const totalCarrito = cartItems.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  return (
    <div className="panel-contenido">
      {/* Tabs */}
      <div className="tabs-navegacion">
        <button 
          onClick={() => { setActiveTab('feed'); setCheckoutExitoso(false); }} 
          className={`tab-link ${activeTab === 'feed' ? 'activo' : ''}`}
        >
          <Compass size={16} style={{ marginRight: '6px' }} />
          Feed de Shows
        </button>
        <button 
          onClick={() => { setActiveTab('contratar'); setCheckoutExitoso(false); }} 
          className={`tab-link ${activeTab === 'contratar' ? 'activo' : ''}`}
        >
          <Music size={16} style={{ marginRight: '6px' }} />
          Contratar Banda / Show
        </button>
        <button 
          onClick={() => setActiveTab('carrito')} 
          className={`tab-link ${activeTab === 'carrito' ? 'activo' : ''}`}
        >
          <Ticket size={16} style={{ marginRight: '6px' }} />
          Mis Boletos / Carrito ({cartItems.reduce((a, b) => a + b.cantidad, 0)})
        </button>
      </div>

      {/* FEED DE SHOWS */}
      {activeTab === 'feed' && !eventoSeleccionado && (
        <div className="feed-grid">
          {EVENTOS_MALACOPA.map((e) => (
            <div key={e.id} className="tarjeta-premium" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', height: '180px' }}>
                <img 
                  src={e.imagen} 
                  alt={e.titulo} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(10, 7, 18, 0.7)',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px'
                }}>
                  <Star size={12} color="#facc15" />
                  <span>{e.rating}</span>
                </div>
              </div>
              <div>
                <span className="badge-neon badge-morado" style={{ marginBottom: '6px' }}>{e.artista}</span>
                <h3 style={{ fontSize: '18px', margin: '4px 0' }}>{e.titulo}</h3>
                <p style={{ fontSize: '13px', color: 'var(--color-texto-secundario)', minHeight: '40px' }}>
                  {e.descripcion}
                </p>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-texto-secundario)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <Calendar size={14} color="var(--color-neon-magenta)" />
                  <span>{e.fecha} a las {e.hora} hs</span>
                </div>
                <div>📍 {e.lugar}</div>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'between',
                alignItems: 'center',
                marginTop: '8px',
                paddingTop: '8px',
                borderTop: '1px solid var(--color-borde-glass)'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-texto-apagado)' }}>Desde</div>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-neon-cian)' }}>
                    ${e.precioGral} MXN
                  </span>
                </div>
                <button onClick={() => setEventoSeleccionado(e)} className="btn-neon" style={{ padding: '8px 16px', fontSize: '13px' }}>
                  Comprar Boletos
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DETALLE EVENTO / SELECCION BOLETOS */}
      {activeTab === 'feed' && eventoSeleccionado && (
        <div className="tarjeta-premium" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <button onClick={() => setEventoSeleccionado(null)} className="btn-secundario" style={{ marginBottom: '16px' }}>
            ← Volver a Cartelera
          </button>
          <h2>{eventoSeleccionado.titulo}</h2>
          <span className="badge-neon badge-morado" style={{ margin: '8px 0 16px 0' }}>{eventoSeleccionado.artista}</span>
          <img 
            src={eventoSeleccionado.imagen} 
            alt={eventoSeleccionado.titulo} 
            style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', marginBottom: '16px' }} 
          />
          <p style={{ color: 'var(--color-texto-secundario)', marginBottom: '16px' }}>
            {eventoSeleccionado.descripcion}
          </p>

          <form onSubmit={handleComprarBoleto} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '13px', color: 'var(--color-texto-secundario)', display: 'block', marginBottom: '6px' }}>
                  Seleccionar Zona:
                </label>
                <select 
                  value={zona} 
                  onChange={(e) => setZona(e.target.value)} 
                  className="input-premium"
                >
                  <option value="Gral">General - ${eventoSeleccionado.precioGral} MXN</option>
                  <option value="VIP">VIP Backstage - ${eventoSeleccionado.precioVIP} MXN</option>
                </select>
              </div>
              <div style={{ width: '100px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-texto-secundario)', display: 'block', marginBottom: '6px' }}>
                  Cantidad:
                </label>
                <input 
                  type="number" 
                  min="1" 
                  max="10" 
                  value={cantidad} 
                  onChange={(e) => setCantidad(parseInt(e.target.value, 10))} 
                  className="input-premium" 
                />
              </div>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.03)',
              padding: '12px 16px',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'between',
              alignItems: 'center'
            }}>
              <span>Subtotal:</span>
              <strong style={{ fontSize: '18px', color: 'var(--color-neon-cian)' }}>
                ${(zona === 'VIP' ? eventoSeleccionado.precioVIP : eventoSeleccionado.precioGral) * cantidad} MXN
              </strong>
            </div>

            {user.roleLevel < 2 ? (
              <div style={{ color: 'var(--color-neon-magenta)', fontSize: '13px', textAlign: 'center' }}>
                ⚠️ Se requiere nivel de rol 2 (Cliente/Fan) para comprar. Utiliza el selector flotante abajo.
              </div>
            ) : (
              <button type="submit" className="btn-neon" style={{ justifyContent: 'center' }}>
                Añadir al Carrito de Tickets
              </button>
            )}
          </form>
        </div>
      )}

      {/* CONTRATACIONES */}
      {activeTab === 'contratar' && (
        <div className="tarjeta-premium" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2>Cotizar Show Privado / Banda</h2>
          <p style={{ color: 'var(--color-texto-secundario)', marginBottom: '20px', fontSize: '14px' }}>
            ¿Tienes un evento corporativo, boda o concierto privado? Solicita una cotización. Los managers autorizados responderán con una propuesta y contrato digital.
          </p>

          {cotizacionEnviada ? (
            <div style={{
              background: 'rgba(0, 243, 255, 0.1)',
              border: '1px solid var(--color-neon-cian)',
              padding: '20px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <CheckCircle size={40} color="var(--color-neon-cian)" style={{ margin: '0 auto 12px auto' }} />
              <h3>¡Solicitud de Cotización Enviada!</h3>
              <p style={{ fontSize: '13px', marginTop: '6px' }}>El manager de la banda revisará la fecha y te enviará la propuesta financiera bajo el marco de ADEEM.</p>
            </div>
          ) : (
            <form onSubmit={handleCotizar} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--color-texto-secundario)', display: 'block', marginBottom: '6px' }}>
                  Nombre de tu Evento:
                </label>
                <input 
                  type="text" 
                  placeholder="Ej: Boda de Sofía y Carlos / Aniversario Corporativo"
                  value={nombreEvento} 
                  onChange={(e) => setNombreEvento(e.target.value)} 
                  className="input-premium" 
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-texto-secundario)', display: 'block', marginBottom: '6px' }}>
                    Artista / Banda a Cotizar:
                  </label>
                  <select 
                    value={artistaContratar} 
                    onChange={(e) => setArtistaContratar(e.target.value)} 
                    className="input-premium"
                  >
                    <option value="Fractos Show">Fractos Show (Electrónica/Audiovisual)</option>
                    <option value="Grupo ADEEM Norteño">Grupo ADEEM Norteño (Regional Mexicano)</option>
                    <option value="Nu9ve Jazz Quintet">Nu9ve Jazz Quintet (Jazz)</option>
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-texto-secundario)', display: 'block', marginBottom: '6px' }}>
                    Fecha Tentativa:
                  </label>
                  <input 
                    type="date" 
                    value={fechaEvento} 
                    onChange={(e) => setFechaEvento(e.target.value)} 
                    className="input-premium" 
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', color: 'var(--color-texto-secundario)', display: 'block', marginBottom: '6px' }}>
                  Ubicación / Recinto (Venue):
                </label>
                <input 
                  type="text" 
                  placeholder="Ej: Quinta La Ruina, Hermosillo"
                  value={ubicacion} 
                  onChange={(e) => setUprev => setUbicacion(e.target.value)} 
                  className="input-premium" 
                  required
                />
              </div>

              {user.roleLevel < 2 ? (
                <div style={{ color: 'var(--color-neon-magenta)', fontSize: '13px', textAlign: 'center' }}>
                  ⚠️ Se requiere nivel de rol 2 (Cliente/Fan) para cotizar.
                </div>
              ) : (
                <button type="submit" className="btn-neon" style={{ justifyContent: 'center' }}>
                  Enviar Solicitud al Manager
                </button>
              )}
            </form>
          )}
        </div>
      )}

      {/* CARRITO Y MIS TICKETS */}
      {activeTab === 'carrito' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {checkoutExitoso && ticketComprado ? (
            <div className="tarjeta-premium" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
              <CheckCircle size={48} color="var(--color-neon-cian)" style={{ margin: '0 auto 12px auto' }} />
              <h2>¡Pago Procesado Exitosamente!</h2>
              <span className="badge-neon badge-cian" style={{ margin: '8px 0 16px 0' }}>Folio: {ticketComprado.folio}</span>
              
              <div style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '16px',
                borderRadius: '12px',
                textAlign: 'left',
                marginBottom: '16px',
                border: '1px dashed var(--color-borde-glass)'
              }}>
                <h4 style={{ marginBottom: '8px' }}>Detalles de Compra:</h4>
                {ticketComprado.items.map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'between', fontSize: '13.5px', marginBottom: '4px' }}>
                    <span>{it.cantidad}x {it.titulo} ({it.zona})</span>
                    <span>${it.precio * it.cantidad} MXN</span>
                  </div>
                ))}
                <div style={{
                  marginTop: '12px',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--color-borde-glass)',
                  display: 'flex',
                  justifyContent: 'between',
                  fontWeight: '700'
                }}>
                  <span>Total Pagado:</span>
                  <span color="var(--color-neon-cian)">${ticketComprado.total} MXN</span>
                </div>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--color-texto-secundario)', marginBottom: '16px' }}>
                Se ha generado tu ticket digital. Puedes compartirlo con tus amigos para el acceso.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button onClick={() => {
                  const itemsMsg = ticketComprado.items.map(it => `${it.cantidad}x ${it.titulo} (${it.zona})`).join(', ');
                  const text = encodeURIComponent(`¡Qué onda! Ya tengo mis boletos en Malacopa para: ${itemsMsg}. Folio: ${ticketComprado.folio}. ¡Ahí nos vemos! 🎸`);
                  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                }} className="btn-secundario">
                  Compartir Ticket por WhatsApp
                </button>
                <button onClick={() => setCheckoutExitoso(false)} className="btn-neon">
                  Comprar Más
                </button>
              </div>
            </div>
          ) : (
            <div className="grid-dashboard">
              {/* Carrito de Compras */}
              <div className="tarjeta-premium">
                <h3>Carrito de Boletos</h3>
                {cartItems.length === 0 ? (
                  <p style={{ color: 'var(--color-texto-secundario)', marginTop: '16px' }}>El carrito está vacío. Ve al feed y selecciona boletos para tus shows favoritos.</p>
                ) : (
                  <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {cartItems.map((item, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        justifyContent: 'between',
                        alignItems: 'center',
                        background: 'rgba(255,255,255,0.02)',
                        padding: '12px',
                        borderRadius: '10px',
                        border: '1px solid var(--color-borde-glass)'
                      }}>
                        <div>
                          <h4 style={{ fontSize: '15px' }}>{item.titulo}</h4>
                          <span className="badge-neon badge-morado" style={{ fontSize: '10px', padding: '2px 6px', marginTop: '4px' }}>
                            {item.artista} - {item.zona}
                          </span>
                          <div style={{ fontSize: '12px', color: 'var(--color-texto-apagado)', marginTop: '4px' }}>
                            {item.cantidad} entrada(s) x ${item.precio}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <strong style={{ color: 'var(--color-neon-cian)' }}>${item.precio * item.cantidad} MXN</strong>
                          <button 
                            onClick={() => removeFromCart(item.id, item.zona)} 
                            className="btn-secundario" 
                            style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--color-neon-magenta)' }}
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Resumen y Checkout */}
              {cartItems.length > 0 && (
                <div className="tarjeta-premium" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3>Resumen de Compra</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'between' }}>
                      <span>Subtotal:</span>
                      <span>${totalCarrito} MXN</span>
                    </div>

                    {/* Simulación de Puntos */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      background: 'rgba(138,43,226,0.05)',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid rgba(138,43,226,0.2)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px' }}>Puntos acumulados: {points} (${pointsDiscount} MXN)</span>
                        <input
                          type="checkbox"
                          checked={usarPuntos}
                          onChange={(e) => setUsarPuntos(e.target.checked)}
                          style={{ cursor: 'pointer' }}
                        />
                      </div>
                      {usarPuntos && (
                        <div style={{ fontSize: '12px', color: 'var(--color-neon-cian)' }}>
                          Descuento aplicado: -${pointsDiscount} MXN
                        </div>
                      )}
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'between',
                      fontWeight: '700',
                      fontSize: '16px',
                      marginTop: '8px',
                      paddingTop: '8px',
                      borderTop: '1px solid var(--color-borde-glass)'
                    }}>
                      <span>Total final:</span>
                      <span style={{ color: 'var(--color-neon-cian)' }}>
                        ${Math.max(0, totalCarrito - (usarPuntos ? pointsDiscount : 0))} MXN
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                    <button 
                      onClick={() => procesarCompraCarrito('paypal')} 
                      className="btn-neon" 
                      style={{ justifyContent: 'center' }}
                    >
                      <CreditCard size={16} />
                      Pagar con PayPal (Simulado)
                    </button>
                    <button 
                      onClick={() => procesarCompraCarrito('whatsapp')} 
                      className="btn-secundario" 
                      style={{ justifyContent: 'center' }}
                    >
                      Solicitar por WhatsApp
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
