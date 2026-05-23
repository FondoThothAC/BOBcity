/* ============================================================================
   Malacopa - Dashboard del Empresario / Manager (React)
   ============================================================================
   Módulo de administración financiera bajo normas oficiales NIF B-3
   (Estado de Resultados) y NIF B-2 (Flujo de Efectivo), contratos
   y gestión de cotizaciones de shows.
   ============================================================================ */

import React, { useState, useEffect } from 'react';
import { Briefcase, DollarSign, FileText, CheckCircle, XCircle, TrendingUp, ShieldAlert } from 'lucide-react';

const COTIZACIONES_DEFAULT = [
  {
    id: 'cot_1',
    cliente: 'Sofía Celis Robles',
    contacto: 'sofia@gmail.com',
    evento: 'Boda de Ensueño',
    artista: 'Fractos Show',
    fecha: '2026-07-15',
    lugar: 'Salón Eventos Quinta Real',
    estado: 'Pendiente',
    montoPropuesto: 35000
  },
  {
    id: 'cot_2',
    cliente: 'Gobierno Municipal Hermosillo',
    contacto: 'contacto@hermosillo.gob.mx',
    evento: 'Fiestas del Pitic 2026',
    artista: 'Grupo ADEEM Norteño',
    fecha: '2026-06-28',
    lugar: 'Plaza Zaragoza, Hermosillo',
    estado: 'Aprobado',
    montoPropuesto: 90000
  }
];

const TRANSACCIONES_DEFAULT = [
  { id: 't_1', tipo: 'operacion', desc: 'Contrato Fiestas del Pitic (Anticipo)', monto: 45000, fecha: '2026-05-10' },
  { id: 't_2', tipo: 'operacion', desc: 'Venta de Boletos - Fractos Tour', monto: 18450, fecha: '2026-05-12' },
  { id: 't_3', tipo: 'operacion', desc: 'Venta de Boletos - Noche Jazz', monto: 8200, fecha: '2026-05-14' },
  { id: 't_4', tipo: 'inversion', desc: 'Compra de Micrófonos Shure e In-ears', monto: -12000, fecha: '2026-05-15' },
  { id: 't_5', tipo: 'financiamiento', desc: 'Pago Comisión Manager (15%)', monto: -6750, fecha: '2026-05-16' },
  { id: 't_6', tipo: 'inversion', desc: 'Adquisición Consola Digital Behringer x32', monto: -28000, fecha: '2026-05-18' }
];

export default function ManagerDashboard() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [transacciones, setTransacciones] = useState([]);
  const [activeTab, setActiveTab] = useState('cotizaciones');

  // Cargar datos
  useEffect(() => {
    try {
      const storedCot = localStorage.getItem('malacopa_cotizaciones');
      const storedTrans = localStorage.getItem('malacopa_transacciones');

      if (storedCot) {
        setCotizaciones(JSON.parse(storedCot));
      } else {
        setCotizaciones(COTIZACIONES_DEFAULT);
        localStorage.setItem('malacopa_cotizaciones', JSON.stringify(COTIZACIONES_DEFAULT));
      }

      if (storedTrans) {
        setTransacciones(JSON.parse(storedTrans));
      } else {
        setTransacciones(TRANSACCIONES_DEFAULT);
        localStorage.setItem('malacopa_transacciones', JSON.stringify(TRANSACCIONES_DEFAULT));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const actualizarCotizaciones = (lista) => {
    setCotizaciones(lista);
    localStorage.setItem('malacopa_cotizaciones', JSON.stringify(lista));
  };

  const actualizarTransacciones = (lista) => {
    setTransacciones(lista);
    localStorage.setItem('malacopa_transacciones', JSON.stringify(lista));
  };

  const handleAprobarCotizacion = (id) => {
    const seleccionada = cotizaciones.find((c) => c.id === id);
    if (!seleccionada) return;

    // Actualizar estado a aprobado
    const listaActualizada = cotizaciones.map((c) => 
      c.id === id ? { ...c, estado: 'Aprobado' } : c
    );
    actualizarCotizaciones(listaActualizada);

    // Agregar un anticipo del 50% al Flujo Financiero
    const montoAnticipo = seleccionada.montoPropuesto / 2;
    const nuevaTrans = {
      id: `t_${Date.now()}`,
      tipo: 'operacion',
      desc: `Anticipo Contrato: ${seleccionada.evento} (${seleccionada.artista})`,
      monto: montoAnticipo,
      fecha: new Date().toISOString().split('T')[0]
    };
    actualizarTransacciones([...transacciones, nuevaTrans]);
  };

  const handleRechazarCotizacion = (id) => {
    const listaActualizada = cotizaciones.map((c) => 
      c.id === id ? { ...c, estado: 'Rechazado' } : c
    );
    actualizarCotizaciones(listaActualizada);
  };

  // --- CÁLCULOS FINANCIEROS BAJO NIF ---
  
  // NIF B-3: Estado de Resultados Integral
  const ingresosTotales = transacciones
    .filter((t) => t.tipo === 'operacion' && t.monto > 0)
    .reduce((acc, t) => acc + t.monto, 0);

  // Costo directo de espectáculos (pago estimado a músicos: 40% de ingresos)
  const costoDeShows = ingresosTotales * 0.4;
  const utilidadBruta = ingresosTotales - costoDeShows;

  // Gastos generales (Comisiones del manager: 15%, y otros gastos negativos de operación)
  const comisionManager = ingresosTotales * 0.15;
  const gastosOperativosNegativos = Math.abs(
    transacciones
      .filter((t) => t.tipo === 'operacion' && t.monto < 0)
      .reduce((acc, t) => acc + t.monto, 0)
  );
  const totalGastosGenerales = comisionManager + gastosOperativosNegativos;
  const utilidadNeta = utilidadBruta - totalGastosGenerales;

  // NIF B-2: Flujos de Efectivo
  const flujoOperacion = transacciones
    .filter((t) => t.tipo === 'operacion')
    .reduce((acc, t) => acc + t.monto, 0);

  const flujoInversion = transacciones
    .filter((t) => t.tipo === 'inversion')
    .reduce((acc, t) => acc + t.monto, 0);

  const flujoFinanciamiento = transacciones
    .filter((t) => t.tipo === 'financiamiento')
    .reduce((acc, t) => acc + t.monto, 0);

  const incrementoNetoEfectivo = flujoOperacion + flujoInversion + flujoFinanciamiento;

  return (
    <div className="panel-contenido">
      {/* Tabs */}
      <div className="tabs-navegacion">
        <button 
          onClick={() => setActiveTab('cotizaciones')} 
          className={`tab-link ${activeTab === 'cotizaciones' ? 'activo' : ''}`}
        >
          <Briefcase size={16} style={{ marginRight: '6px' }} />
          Solicitudes y Contratos ({cotizaciones.filter(c => c.estado === 'Pendiente').length})
        </button>
        <button 
          onClick={() => setActiveTab('nif_b3')} 
          className={`tab-link ${activeTab === 'nif_b3' ? 'activo' : ''}`}
        >
          <DollarSign size={16} style={{ marginRight: '6px' }} />
          Estado de Resultados (NIF B-3)
        </button>
        <button 
          onClick={() => setActiveTab('nif_b2')} 
          className={`tab-link ${activeTab === 'nif_b2' ? 'activo' : ''}`}
        >
          <FileText size={16} style={{ marginRight: '6px' }} />
          Flujo de Efectivo (NIF B-2)
        </button>
      </div>

      {/* SECCIÓN SOLICITUDES */}
      {activeTab === 'cotizaciones' && (
        <div className="tarjeta-premium">
          <h3>Contrataciones de Espectáculos</h3>
          <p style={{ fontSize: '13px', color: 'var(--color-texto-secundario)', marginBottom: '16px' }}>
            Revisa las propuestas de los contratantes. Al aprobarlas, se redactará el contrato automático y se cobrará un 50% de anticipo.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
            {cotizaciones.map((c) => (
              <div key={c.id} className="efecto-glass" style={{
                padding: '20px',
                border: '1px solid var(--color-borde-glass)',
                display: 'flex',
                justifyContent: 'between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className={`badge-neon ${c.estado === 'Aprobado' ? 'badge-cian' : c.estado === 'Rechazado' ? 'badge-magenta' : 'badge-morado'}`}>
                      {c.estado}
                    </span>
                    <span style={{ fontSize: '11.5px', color: 'var(--color-texto-apagado)' }}>🗓️ {c.fecha}</span>
                  </div>
                  <h4 style={{ margin: '8px 0 4px 0', fontSize: '16px' }}>{c.evento} - {c.artista}</h4>
                  <div style={{ fontSize: '13px', color: 'var(--color-texto-secundario)' }}>
                    Contratante: <strong>{c.cliente}</strong> ({c.contacto})
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-texto-apagado)', marginTop: '2px' }}>
                    📍 Lugar: {c.lugar}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-texto-apagado)', display: 'block' }}>Propuesta</span>
                    <strong style={{ fontSize: '18px', color: 'var(--color-neon-cian)' }}>
                      ${c.montoPropuesto} MXN
                    </strong>
                  </div>

                  {c.estado === 'Pendiente' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleAprobarCotizacion(c.id)} 
                        className="btn-neon" 
                        style={{ padding: '8px 14px', fontSize: '12px' }}
                      >
                        <CheckCircle size={14} />
                        Aceptar
                      </button>
                      <button 
                        onClick={() => handleRechazarCotizacion(c.id)} 
                        className="btn-secundario" 
                        style={{ padding: '8px 14px', fontSize: '12px', color: 'var(--color-neon-magenta)' }}
                      >
                        <XCircle size={14} />
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ESTADO DE RESULTADOS NIF B-3 */}
      {activeTab === 'nif_b3' && (
        <div className="grid-dashboard">
          {/* Reporte de Resultados */}
          <div className="tarjeta-premium">
            <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>Estado de Resultados Integral (NIF B-3)</h3>
              <span style={{ fontSize: '12px', color: 'var(--color-texto-apagado)' }}>Pesos Mexicanos (MXN)</span>
            </div>
            
            <div className="tabla-contenedor">
              <table className="tabla-nif">
                <thead>
                  <tr>
                    <th>Concepto Financiero</th>
                    <th style={{ textAlign: 'right' }}>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Ingresos por Espectáculos y Boletos (Netos)</strong></td>
                    <td style={{ textAlign: 'right', color: 'var(--color-neon-cian)', fontWeight: '600' }}>
                      ${ingresosTotales.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td>(-) Costo de Shows (Pago a Músicos / Colaboradores - 40%)</td>
                    <td style={{ textAlign: 'right', color: 'var(--color-neon-magenta)' }}>
                      -${costoDeShows.toFixed(2)}
                    </td>
                  </tr>
                  <tr className="fila-total">
                    <td><strong>UTILIDAD BRUTA</strong></td>
                    <td style={{ textAlign: 'right', fontWeight: '700' }}>
                      ${utilidadBruta.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td>(-) Comisión del Manager (15%)</td>
                    <td style={{ textAlign: 'right', color: 'var(--color-neon-magenta)' }}>
                      -${comisionManager.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td>(-) Gastos Operativos Generales</td>
                    <td style={{ textAlign: 'right', color: 'var(--color-neon-magenta)' }}>
                      -${gastosOperativosNegativos.toFixed(2)}
                    </td>
                  </tr>
                  <tr className="fila-total">
                    <td><strong>UTILIDAD NETA OPERACIONAL</strong></td>
                    <td style={{ textAlign: 'right', fontWeight: '800', color: 'var(--color-neon-cian)' }}>
                      ${utilidadNeta.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Tarjeta de Métricas rápidas */}
          <div className="tarjeta-premium" style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <TrendingUp size={48} color="var(--color-neon-cian)" style={{ margin: '0 auto 12px auto' }} />
              <h3>Margen de Utilidad Neta</h3>
              <span style={{ fontSize: '32px', fontWeight: '800', color: 'var(--color-neon-cian)', display: 'block', margin: '8px 0' }}>
                {ingresosTotales > 0 ? `${((utilidadNeta / ingresosTotales) * 100).toFixed(1)}%` : '0%'}
              </span>
              <p style={{ fontSize: '13px', color: 'var(--color-texto-secundario)', lineHeight: '1.4' }}>
                Mide la rentabilidad de las producciones después de liquidar honorarios a músicos y costos logísticos bajo el marco de la ADEEM.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FLUJOS DE EFECTIVO NIF B-2 */}
      {activeTab === 'nif_b2' && (
        <div className="tarjeta-premium">
          <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '16px' }}>
            <h3>Estado de Flujos de Efectivo (NIF B-2)</h3>
            <span style={{ fontSize: '12px', color: 'var(--color-texto-apagado)' }}>Método Directo</span>
          </div>

          <div className="tabla-contenedor" style={{ marginBottom: '24px' }}>
            <table className="tabla-nif">
              <thead>
                <tr>
                  <th>Clasificación de Actividades</th>
                  <th style={{ textAlign: 'right' }}>Flujo Neto</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Actividades de Operación</strong> (Contratos, Anticipos, Boletos)</td>
                  <td style={{ textAlign: 'right', color: flujoOperacion >= 0 ? 'var(--color-neon-cian)' : 'var(--color-neon-magenta)' }}>
                    ${flujoOperacion.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td><strong>Actividades de Inversión</strong> (Adquisición de equipo de audio/luces)</td>
                  <td style={{ textAlign: 'right', color: flujoInversion >= 0 ? 'var(--color-neon-cian)' : 'var(--color-neon-magenta)' }}>
                    ${flujoInversion.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td><strong>Actividades de Financiamiento</strong> (Pago comisiones de capital)</td>
                  <td style={{ textAlign: 'right', color: flujoFinanciamiento >= 0 ? 'var(--color-neon-cian)' : 'var(--color-neon-magenta)' }}>
                    ${flujoFinanciamiento.toFixed(2)}
                  </td>
                </tr>
                <tr className="fila-total">
                  <td><strong>INCREMENTO NETO DE EFECTIVO</strong></td>
                  <td style={{ textAlign: 'right', fontWeight: '800' }}>
                    ${incrementoNetoEfectivo.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Historial completo de movimientos */}
          <h3>Historial de Transacciones</h3>
          <div className="tabla-contenedor" style={{ marginTop: '12px' }}>
            <table className="tabla-nif">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Categoría</th>
                  <th style={{ textAlign: 'right' }}>Monto</th>
                </tr>
              </thead>
              <tbody>
                {transacciones.map((t) => (
                  <tr key={t.id}>
                    <td>{t.fecha}</td>
                    <td>{t.desc}</td>
                    <td>
                      <span className={`badge-neon ${t.tipo === 'operacion' ? 'badge-cian' : t.tipo === 'inversion' ? 'badge-morado' : 'badge-magenta'}`}>
                        {t.tipo}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '600', color: t.monto >= 0 ? 'var(--color-neon-cian)' : 'var(--color-neon-magenta)' }}>
                      {t.monto >= 0 ? `+$${t.monto.toFixed(2)}` : `-$${Math.abs(t.monto).toFixed(2)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
