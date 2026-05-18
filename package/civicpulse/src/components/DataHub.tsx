import { useState } from 'react';
import { Card, Badge } from '@/components/ui';
import { DATA_PACKAGES, SUBSCRIPTION_TIERS } from '@/models/mockData';
import type { DataPackage, SubscriptionTier } from '@/models/dataModel';

// ============================================================
// DataHub Component - Monetization & Data Center
// ============================================================

export function DataHub() {
  const [activeTab, setActiveTab] = useState<'packages' | 'subscription'>('packages');
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [hoveredPackage, setHoveredPackage] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Centro de Datos y Monetización</h2>
          <p className="text-gray-400">Paquetes de datos, censos y APIs predictivas</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="info" className="px-3 py-1">
            🔒 Datos Verificados
          </Badge>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-white/10">
        <button
          onClick={() => setActiveTab('packages')}
          className={`px-6 py-3 text-lg font-medium transition-all relative ${
            activeTab === 'packages'
              ? 'text-emerald-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Paquetes de Datos
          {activeTab === 'packages' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('subscription')}
          className={`px-6 py-3 text-lg font-medium transition-all relative ${
            activeTab === 'subscription'
              ? 'text-emerald-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Planes de Suscripción
          {activeTab === 'subscription' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
          )}
        </button>
      </div>

      {/* Packages Tab */}
      {activeTab === 'packages' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {DATA_PACKAGES.map(pkg => (
            <Card
              key={pkg.id}
              className={`p-6 transition-all cursor-pointer ${
                selectedPackage === pkg.id
                  ? 'bg-emerald-500/20 border-2 border-emerald-500'
                  : hoveredPackage === pkg.id
                  ? 'bg-emerald-500/10 border border-emerald-500/50'
                  : 'hover:border-emerald-500/30'
              }`}
              onClick={() => setSelectedPackage(pkg.id)}
              onMouseEnter={() => setHoveredPackage(pkg.id)}
              onMouseLeave={() => setHoveredPackage(null)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <Badge
                  variant={
                    pkg.category === 'census' ? 'info' :
                    pkg.category === 'electoral' ? 'warning' :
                    pkg.category === 'predictive' ? 'success' :
                    'default'
                  }
                >
                  {pkg.category === 'census' ? '📊' :
                   pkg.category === 'electoral' ? '🗳️' :
                   pkg.category === 'predictive' ? '🤖' :
                   '📈'} {pkg.category}
                </Badge>
                <Badge variant="default" className="text-xs">
                  {pkg.dataLevel}
                </Badge>
              </div>

              {/* Name & Description */}
              <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-3">{pkg.description}</p>

              {/* Includes */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 uppercase mb-2">Incluye:</p>
                <ul className="space-y-1">
                  {pkg.includes.slice(0, 3).map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="text-emerald-500">✓</span>
                      {item}
                    </li>
                  ))}
                  {pkg.includes.length > 3 && (
                    <li className="text-sm text-gray-500">
                      +{pkg.includes.length - 3} más...
                    </li>
                  )}
                </ul>
              </div>

              {/* Formats & Refresh */}
              <div className="flex items-center gap-2 mb-4">
                {pkg.formats.map(format => (
                  <span
                    key={format}
                    className="px-2 py-1 bg-black/30 rounded text-xs text-gray-400 uppercase"
                  >
                    {format}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Precio</p>
                    <p className="text-2xl font-bold text-white">
                      {formatPrice(pkg.price)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {pkg.billingCycle === 'one_time' ? 'único' :
                       pkg.billingCycle === 'monthly' ? '/mes' : '/año'}
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-emerald-500/30 transition-all">
                    Adquirir
                  </button>
                </div>
              </div>

              {/* Refresh Rate */}
              <div className="mt-3 text-xs text-gray-500">
                Actualización: {pkg.refreshRate === 'realtime' ? '🔴 Tiempo real' :
                               pkg.refreshRate === 'daily' ? 'Diario' :
                               pkg.refreshRate === 'weekly' ? 'Semanal' : 'Mensual'}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Subscription Tab */}
      {activeTab === 'subscription' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SUBSCRIPTION_TIERS.map(tier => (
            <Card
              key={tier.id}
              className={`p-6 transition-all ${
                tier.id === 'tier_enterprise'
                  ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-2 border-purple-500'
                  : 'bg-gradient-to-br from-gray-900/50 to-gray-800/50'
              }`}
            >
              {/* Header */}
              <div className="text-center mb-6">
                <h3 className={`text-xl font-bold mb-2 ${
                  tier.id === 'tier_enterprise' ? 'text-purple-300' : 'text-white'
                }`}>
                  {tier.name}
                </h3>
                {tier.id === 'tier_enterprise' && (
                  <Badge variant="warning" className="mb-2">⭐ Más Popular</Badge>
                )}
                <p className="text-4xl font-bold text-white">
                  {formatPrice(tier.price)}
                  <span className="text-sm text-gray-400 font-normal">/mes</span>
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-emerald-500 mt-0.5">✓</span>
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Data Access */}
              <div className="mb-6">
                <p className="text-xs text-gray-500 uppercase mb-2">Acceso a Datos:</p>
                <div className="flex flex-wrap gap-2">
                  {tier.dataAccess.map(dataType => (
                    <span
                      key={dataType}
                      className="px-2 py-1 bg-black/30 rounded text-xs text-gray-400"
                    >
                      {dataType}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <button className={`w-full py-3 rounded-lg font-semibold transition-all ${
                tier.id === 'tier_basic'
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : tier.id === 'tier_professional'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/30'
              }`}>
                {tier.id === 'tier_basic' ? 'Comenzar Gratis' :
                 tier.id === 'tier_professional' ? 'Suscribirse' : 'Contactar Ventas'}
              </button>
            </Card>
          ))}
        </div>
      )}

      {/* Info Banner */}
      <Card className="p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30">
        <div className="flex items-center gap-6">
          <div className="text-4xl">💡</div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">
              ¿Necesitas datos personalizados?
            </h3>
            <p className="text-gray-400 text-sm mb-3">
              Ofrecemos servicios de consultoría para crear paquetes de datos a medida para tu proyecto.
              Contáctanos para discutir tus necesidades específicas.
            </p>
            <button className="px-4 py-2 bg-amber-500/20 border border-amber-500 text-amber-400 rounded-lg text-sm font-medium hover:bg-amber-500/30 transition-all">
              Solicitar Consulta
            </button>
          </div>
        </div>
      </Card>

      {/* API Documentation Preview */}
      <Card className="p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Vista Previa de API</h3>
        <div className="bg-black/50 rounded-lg p-4 font-mono text-sm">
          <p className="text-gray-500 mb-2">// Ejemplo de respuesta API - Predicción Electoral</p>
          <p className="text-purple-400 mb-1">curl -X GET https://api.civicpulse.io/v1/predict</p>
          <p className="text-gray-500 mb-1">-H "Authorization: Bearer YOUR_API_KEY"</p>
          <p className="text-gray-500 mb-1">-d '{"{"}</p>
          <p className="text-gray-400 pl-4 mb-1">"candidate_id": "cand_001",</p>
          <p className="text-gray-400 pl-4 mb-1">"district_id": "district_2",</p>
          <p className="text-gray-400 pl-4 mb-1">"include_factors": true</p>
          <p className="text-gray-500 mb-3">{"}"}'</p>
          <p className="text-gray-500 mb-2">// Response:</p>
          <p className="text-emerald-400 mb-1">{"{"}</p>
          <p className="text-gray-300 pl-4 mb-1">"win_probability": 68.5,</p>
          <p className="text-gray-300 pl-4 mb-1">"confidence_interval": [55.2, 81.8],</p>
          <p className="text-gray-300 pl-4 mb-1">"factors": [</p>
          <p className="text-gray-400 pl-8 mb-1">{"{"}"name": "Experiencia gubernamental", "contribution": 8.0{"}"},"</p>
          <p className="text-gray-400 pl-8 mb-1">{"{"}"name": "Efecto de incumbencia", "contribution": 7.0{"}"}</p>
          <p className="text-gray-300 pl-4">]</p>
          <p className="text-emerald-400">{"}"}</p>
        </div>
      </Card>
    </div>
  );
}

export default DataHub;