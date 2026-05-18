import { useState, useMemo } from 'react';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, Badge } from '@/components/ui';
import { KPI_DASHBOARD, ELECTORAL_HISTORY, PAIN_POINTS } from '@/models/mockData';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/models/dataModel';

// ============================================================
// Analytics Dashboard Component
// ============================================================

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'1m' | '3m' | '6m' | '1y'>('6m');
  const [selectedMetric, setSelectedMetric] = useState<'engagement' | 'pain' | 'electoral'>('engagement');

  // Overview stats
  const overviewData = useMemo(() => {
    return [
      {
        label: 'Puntos de Dolor Totales',
        value: KPI_DASHBOARD.overview.totalPainPoints,
        change: KPI_DASHBOARD.overview.painPointGrowth,
        trend: 'up' as const,
        icon: '🔥',
        color: 'red'
      },
      {
        label: 'Propuestas Activas',
        value: KPI_DASHBOARD.overview.activeProposals,
        change: 8.5,
        trend: 'up' as const,
        icon: '📋',
        color: 'blue'
      },
      {
        label: 'Engagement Ciudadana',
        value: KPI_DASHBOARD.overview.citizenEngagement,
        change: 15.2,
        trend: 'up' as const,
        icon: '👥',
        color: 'emerald'
      },
      {
        label: 'Días hasta Elección',
        value: KPI_DASHBOARD.electoral.daysUntil,
        change: -2,
        trend: 'neutral' as const,
        icon: '📅',
        color: 'amber'
      }
    ];
  }, []);

  // Pain points trend data (simulated)
  const painTrendData = useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const currentMonth = new Date().getMonth();

    return months.slice(0, currentMonth + 1).map((month, i) => ({
      month,
      security: 70 + Math.sin(i * 0.5) * 10 + Math.random() * 5,
      water: 65 + Math.cos(i * 0.3) * 8 + Math.random() * 5,
      economy: 60 + Math.sin(i * 0.4) * 7 + Math.random() * 5,
      transport: 55 + Math.random() * 10,
      total: 65 + Math.sin(i * 0.3) * 8 + Math.random() * 5
    }));
  }, []);

  // Electoral trend data
  const electoralTrendData = useMemo(() => {
    return ELECTORAL_HISTORY.map(election => ({
      year: new Date(election.date).getFullYear().toString(),
      morena: election.results.find(r => r.party === 'MORENA')?.percentage || 0,
      pan: election.results.find(r => r.party === 'PAN')?.percentage || 0,
      pri: election.results.find(r => r.party === 'PRI')?.percentage || 0,
      turnout: election.turnout
    }));
  }, []);

  // Category distribution for pie chart
  const categoryDistribution = useMemo(() => {
    return KPI_DASHBOARD.categories.map(cat => ({
      name: CATEGORY_LABELS[cat.category],
      value: cat.count,
      color: CATEGORY_COLORS[cat.category]
    }));
  }, []);

  // Top districts by pain level
  const topDistricts = useMemo(() => {
    const districtPain = PAIN_POINTS.reduce((acc, pp) => {
      if (!acc[pp.districtId]) {
        acc[pp.districtId] = { count: 0, totalIntensity: 0 };
      }
      acc[pp.districtId].count++;
      acc[pp.districtId].totalIntensity += pp.intensity;
      return acc;
    }, {} as Record<string, { count: number; totalIntensity: number }>);

    return Object.entries(districtPain)
      .map(([districtId, data]) => ({
        districtId,
        avgIntensity: data.totalIntensity / data.count,
        count: data.count
      }))
      .sort((a, b) => b.avgIntensity - a.avgIntensity)
      .slice(0, 5);
  }, []);

  // Promise fulfillment rate (simulated)
  const promiseData = useMemo(() => {
    return [
      { name: 'Cumplidas', value: 47, color: '#00ff88' },
      { name: 'En Progreso', value: 28, color: '#00aaff' },
      { name: 'No Cumplidas', value: 25, color: '#ff4444' }
    ];
  }, []);

  // Engagement metrics
  const engagementData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      month: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][i],
      reports: 200 + Math.floor(Math.random() * 150),
      proposals: 30 + Math.floor(Math.random() * 20),
      comments: 500 + Math.floor(Math.random() * 300)
    }));
  }, []);

  const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#6b7280'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard Analítico</h2>
          <p className="text-gray-400">Métricas y KPIs de Inteligencia Cívica</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value as typeof timeRange)}
            className="bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="1m">Último mes</option>
            <option value="3m">Últimos 3 meses</option>
            <option value="6m">Últimos 6 meses</option>
            <option value="1y">Último año</option>
          </select>
          <Badge variant="success" className="px-3 py-1">
            Live
          </Badge>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewData.map((stat, i) => (
          <Card
            key={i}
            className={`p-5 bg-gradient-to-br ${
              stat.color === 'red' ? 'from-red-900/50 to-rose-900/50 border-red-500/30' :
              stat.color === 'blue' ? 'from-blue-900/50 to-indigo-900/50 border-blue-500/30' :
              stat.color === 'emerald' ? 'from-emerald-900/50 to-teal-900/50 border-emerald-500/30' :
              'from-amber-900/50 to-orange-900/50 border-amber-500/30'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{stat.icon}</span>
              <Badge
                variant={stat.trend === 'up' ? 'success' : stat.trend === 'down' ? 'danger' : 'default'}
                className="text-xs"
              >
                {stat.trend === 'up' ? '↑' : stat.trend === 'down' ? '↓' : '→'} {Math.abs(stat.change)}%
              </Badge>
            </div>
            <p className="text-3xl font-bold text-white">{stat.value.toLocaleString()}</p>
            <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Charts Column */}
        <div className="xl:col-span-2 space-y-6">
          {/* Time Series Chart */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Tendencias de Puntos de Dolor</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedMetric('pain')}
                  className={`px-3 py-1 rounded text-xs ${
                    selectedMetric === 'pain' ? 'bg-emerald-500 text-white' : 'bg-black/30 text-gray-400'
                  }`}
                >
                  Dolor
                </button>
                <button
                  onClick={() => setSelectedMetric('engagement')}
                  className={`px-3 py-1 rounded text-xs ${
                    selectedMetric === 'engagement' ? 'bg-emerald-500 text-white' : 'bg-black/30 text-gray-400'
                  }`}
                >
                  Engagement
                </button>
                <button
                  onClick={() => setSelectedMetric('electoral')}
                  className={`px-3 py-1 rounded text-xs ${
                    selectedMetric === 'electoral' ? 'bg-emerald-500 text-white' : 'bg-black/30 text-gray-400'
                  }`}
                >
                  Electoral
                </button>
              </div>
            </div>

            <div className="h-[300px]">
              {selectedMetric === 'pain' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={painTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} domain={[40, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a2e',
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Area type="monotone" dataKey="security" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Seguridad" />
                    <Area type="monotone" dataKey="water" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Agua" />
                    <Area type="monotone" dataKey="economy" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} name="Economía" />
                    <Area type="monotone" dataKey="transport" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Transporte" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : selectedMetric === 'engagement' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a2e',
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Line type="monotone" dataKey="reports" stroke="#00ff88" strokeWidth={2} name="Reportes" dot={{ fill: '#00ff88' }} />
                    <Line type="monotone" dataKey="proposals" stroke="#00aaff" strokeWidth={2} name="Propuestas" dot={{ fill: '#00aaff' }} />
                    <Line type="monotone" dataKey="comments" stroke="#ff6600" strokeWidth={2} name="Comentarios" dot={{ fill: '#ff6600' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={electoralTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="year" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 80]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a2e',
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Line type="monotone" dataKey="morena" stroke="#00ff00" strokeWidth={3} name="MORENA" dot={{ fill: '#00ff00', r: 6 }} />
                    <Line type="monotone" dataKey="pan" stroke="#0066ff" strokeWidth={3} name="PAN" dot={{ fill: '#0066ff', r: 6 }} />
                    <Line type="monotone" dataKey="pri" stroke="#ff6600" strokeWidth={3} name="PRI" dot={{ fill: '#ff6600', r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Electoral Participation Chart */}
          <Card className="p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Participación Electoral Histórica</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={electoralTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="year" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} domain={[50, 80]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a2e',
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value}%`, 'Participación']}
                  />
                  <Bar dataKey="turnout" fill="#8b5cf6" name="Participación %" radius={[4, 4, 0, 0]}>
                    {electoralTrendData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.turnout > 70 ? '#00ff88' : '#ff6600'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Side Panels */}
        <div className="xl:col-span-1 space-y-6">
          {/* Category Distribution */}
          <Card className="p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Distribución por Categoría</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a2e',
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {categoryDistribution.map((entry, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-gray-300">{entry.name}</span>
                  </div>
                  <span className="text-white font-medium">{entry.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Districts */}
          <Card className="p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Distritos Críticos</h3>
            <div className="space-y-3">
              {topDistricts.map((district, index) => (
                <div key={district.districtId} className="p-3 bg-black/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-red-400">#{index + 1}</span>
                      <span className="text-white text-sm">{district.districtId.replace('_', ' ').replace('district', 'Distrito')}</span>
                    </div>
                    <span className="text-red-400 font-bold">{Math.round(district.avgIntensity)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-red-500"
                      style={{ width: `${district.avgIntensity}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{district.count} reportes</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Promise Fulfillment */}
          <Card className="p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Cumplimiento de Promesas</h3>
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={promiseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    dataKey="value"
                  >
                    {promiseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a2e',
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-1">
              {promiseData.map((entry, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-gray-300">{entry.name}</span>
                  </div>
                  <span className="text-white font-medium">{entry.value}%</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Next Election Countdown */}
          <Card className="p-5 bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/30">
            <h3 className="text-lg font-semibold text-white mb-2">Próxima Elección</h3>
            <p className="text-gray-400 text-sm mb-4">Elección Municipal 2027</p>
            <div className="text-center">
              <p className="text-5xl font-bold text-purple-300">{KPI_DASHBOARD.electoral.daysUntil}</p>
              <p className="text-gray-400 mt-1">días restantes</p>
            </div>
            <div className="mt-4 pt-4 border-t border-purple-500/30">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Candidato Líder:</span>
                <span className="text-purple-300 font-medium">María del Rosario López Félix</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-400">Partido:</span>
                <span className="text-emerald-400 font-medium">MORENA</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;