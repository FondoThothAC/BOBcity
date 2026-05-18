import { useState, useMemo, useCallback } from 'react';
// @ts-ignore
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Card, Badge } from '@/components/ui';
import type { Agent, AgentSector, PolicyIntervention } from '@/models/dataModel';
import { SECTOR_LABELS } from '@/models/dataModel';
import { SAMPLE_POLICIES } from '@/models/mockData';
import { generateSyntheticPopulation, runABMSimulation } from '@/models/abmEngine';

// ============================================================
// ABMSimulator Component
// ============================================================

export function ABMSimulator() {
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyIntervention | null>(null);
  const [timeHorizon, setTimeHorizon] = useState<1 | 5 | 10>(5);
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  // Generate population once
  const population = useMemo(() => generateSyntheticPopulation(1000), []);

  // Run simulation
  const simulationResult = useMemo(() => {
    if (!selectedPolicy || !hasRun) return null;
    return runABMSimulation(population, selectedPolicy, timeHorizon);
  }, [selectedPolicy, timeHorizon, hasRun, population]);

  // Sector distribution data
  const sectorData = useMemo(() => {
    const sectors: AgentSector[] = ['small_business', 'young_professional', 'industrial_worker', 'student', 'retiree'];
    const counts: Record<AgentSector, number> = {
      small_business: 0,
      young_professional: 0,
      industrial_worker: 0,
      student: 0,
      retiree: 0
    };

    for (const agent of population) {
      counts[agent.sector]++;
    }

    return sectors.map(sector => ({
      name: SECTOR_LABELS[sector],
      value: counts[sector],
      percentage: (counts[sector] / population.length * 100).toFixed(1)
    }));
  }, [population]);

  // Happiness trajectory data
  const happinessData = useMemo(() => {
    if (!simulationResult) return [];
    const data = [];
    const step = Math.max(1, Math.floor(simulationResult.metrics.happiness.length / 50));
    for (let i = 0; i < simulationResult.metrics.happiness.length; i += step) {
      const year = Math.floor(i / 12);
      const month = i % 12;
      data.push({
        time: `${year}y ${month}m`,
        happiness: Math.round(simulationResult.metrics.happiness[i]),
        gdp: Math.round(simulationResult.metrics.gdp[i])
      });
    }
    return data;
  }, [simulationResult]);

  // Vote intention data
  const voteIntentionData = useMemo(() => {
    if (!simulationResult) return [];
    const parties = Object.keys(simulationResult.metrics.voteIntention);
    const colors: Record<string, string> = {
      'MORENA': '#00ff00',
      'PAN': '#0066ff',
      'PRI': '#ff6600',
      'Other': '#888888'
    };

    return parties.map(party => ({
      name: party,
      initial: Math.round(simulationResult.metrics.voteIntention[party][0]),
      final: Math.round(simulationResult.metrics.voteIntention[party][simulationResult.metrics.voteIntention[party].length - 1]),
      color: colors[party] || '#888888'
    }));
  }, [simulationResult]);

  // Sector impact data
  const sectorImpactData = useMemo(() => {
    if (!simulationResult) return [];
    const sectors = Object.keys(simulationResult.sectorImpact) as AgentSector[];
    return sectors.map(sector => ({
      name: SECTOR_LABELS[sector],
      happiness: Math.round(simulationResult.sectorImpact[sector].happinessChange * 10) / 10,
      income: Math.round(simulationResult.sectorImpact[sector].incomeChange)
    }));
  }, [simulationResult]);

  const handleRunSimulation = useCallback(() => {
    if (!selectedPolicy) return;
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setHasRun(true);
    }, 500);
  }, [selectedPolicy]);

  const handleReset = useCallback(() => {
    setHasRun(false);
    setSelectedPolicy(null);
  }, []);

  const COLORS = ['#00ff88', '#00aaff', '#ff6600', '#ff00aa', '#aa00ff'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Sandbox de Simulación ABM</h2>
          <p className="text-gray-400">Motor de Gemelo Digital Social - Población sintética de 1,000 agentes</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="info" className="text-sm px-3 py-1">
            {population.length.toLocaleString()} Agentes
          </Badge>
          {hasRun && (
            <Badge variant="success" className="text-sm px-3 py-1">
              Simulación Completa
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Control Panel */}
        <div className="xl:col-span-1 space-y-4">
          {/* Policy Selection */}
          <Card className="p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Seleccionar Política</h3>
            <div className="space-y-3">
              {SAMPLE_POLICIES.map(policy => (
                <button
                  key={policy.id}
                  onClick={() => {
                    setSelectedPolicy(policy);
                    setHasRun(false);
                  }}
                  className={`w-full p-4 rounded-lg text-left transition-all ${
                    selectedPolicy?.id === policy.id
                      ? 'bg-emerald-500/20 border-2 border-emerald-500'
                      : 'bg-black/30 border border-white/10 hover:border-emerald-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{policy.name}</span>
                    <Badge
                      variant={
                        policy.type === 'subsidy' ? 'success'
                        : policy.type === 'tax' ? 'danger'
                        : policy.type === 'security' ? 'warning'
                        : 'info'
                      }
                      className="text-xs"
                    >
                      {policy.type}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-400">
                    <p>Costo: ${(policy.cost / 1000000).toFixed(1)}M MXN</p>
                    <p>Duración: {policy.duration} meses</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Time Horizon */}
          <Card className="p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Horizonte de Tiempo</h3>
            <div className="grid grid-cols-3 gap-2">
              {([1, 5, 10] as const).map(years => (
                <button
                  key={years}
                  onClick={() => setTimeHorizon(years)}
                  className={`p-3 rounded-lg font-medium transition-all ${
                    timeHorizon === years
                      ? 'bg-emerald-500 text-white'
                      : 'bg-black/30 text-gray-400 hover:bg-emerald-500/20'
                  }`}
                >
                  {years} {years === 1 ? 'Año' : 'Años'}
                </button>
              ))}
            </div>
          </Card>

          {/* Run Controls */}
          <Card className="p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Controles de Simulación</h3>
            <div className="space-y-3">
              <button
                onClick={handleRunSimulation}
                disabled={!selectedPolicy || isRunning}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  !selectedPolicy
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : isRunning
                    ? 'bg-emerald-700 text-white animate-pulse'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/30'
                }`}
              >
                {isRunning ? 'Ejecutando...' : '▶ Ejecutar Simulación'}
              </button>
              <button
                onClick={handleReset}
                disabled={!hasRun}
                className={`w-full py-3 rounded-lg font-medium transition-all ${
                  !hasRun
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-600 text-white hover:bg-gray-500'
                }`}
              >
                Reiniciar
              </button>
            </div>
          </Card>

          {/* Population Pie Chart */}
          <Card className="p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Distribución de Población</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {sectorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a2e',
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number, name: string, props: any) => [
                      `${props.payload.percentage}%`,
                      name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 gap-1 mt-2">
              {sectorData.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-gray-300">{entry.name}</span>
                  </div>
                  <span className="text-white font-medium">{entry.percentage}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="xl:col-span-2 space-y-6">
          {/* Key Metrics */}
          {hasRun && simulationResult && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border border-emerald-500/30">
                  <p className="text-emerald-400 text-sm mb-1">PIB Municipal</p>
                  <p className="text-2xl font-bold text-white">
                    {simulationResult.metrics.gdp[simulationResult.metrics.gdp.length - 1].toFixed(1)}
                  </p>
                  <p className="text-emerald-400 text-xs mt-1">
                    +{((simulationResult.metrics.gdp[simulationResult.metrics.gdp.length - 1] - 100) / 100 * 100).toFixed(1)}%
                  </p>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-blue-900/50 to-indigo-900/50 border border-blue-500/30">
                  <p className="text-blue-400 text-sm mb-1">Desempleo</p>
                  <p className="text-2xl font-bold text-white">
                    {simulationResult.metrics.unemployment[simulationResult.metrics.unemployment.length - 1].toFixed(1)}%
                  </p>
                  <p className="text-blue-400 text-xs mt-1">
                    {simulationResult.metrics.unemployment[simulationResult.metrics.unemployment.length - 1] < simulationResult.metrics.unemployment[0] ? '↓' : '↑'}
                    {Math.abs(simulationResult.metrics.unemployment[simulationResult.metrics.unemployment.length - 1] - simulationResult.metrics.unemployment[0]).toFixed(1)}pp
                  </p>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-amber-900/50 to-orange-900/50 border border-amber-500/30">
                  <p className="text-amber-400 text-sm mb-1">Felicidad Promedio</p>
                  <p className="text-2xl font-bold text-white">
                    {Math.round(simulationResult.metrics.happiness[simulationResult.metrics.happiness.length - 1])}
                  </p>
                  <p className="text-amber-400 text-xs mt-1">
                    {simulationResult.metrics.happiness[simulationResult.metrics.happiness.length - 1] > simulationResult.metrics.happiness[0] ? '↑' : '↓'}
                    {Math.abs(simulationResult.metrics.happiness[simulationResult.metrics.happiness.length - 1] - simulationResult.metrics.happiness[0]).toFixed(0)} pts
                  </p>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/30">
                  <p className="text-purple-400 text-sm mb-1">Lider en Votación</p>
                  <p className="text-lg font-bold text-white">
                    {voteIntentionData.sort((a, b) => b.final - a.final)[0]?.name}
                  </p>
                  <p className="text-purple-400 text-xs mt-1">
                    {voteIntentionData.sort((a, b) => b.final - a.final)[0]?.final}%
                  </p>
                </Card>
              </div>

              {/* Happiness Trajectory Chart */}
              <Card className="p-5">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Trayectoria de Felicidad y PIB - {selectedPolicy?.name}
                </h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={happinessData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
                      <YAxis yAxisId="left" stroke="#22c55e" fontSize={12} domain={[0, 100]} />
                      <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" fontSize={12} domain={[90, 120]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1a1a2e',
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="happiness"
                        stroke="#22c55e"
                        strokeWidth={2}
                        name="Felicidad"
                        dot={false}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="gdp"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="PIB (indexado)"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Vote Intention Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-5">
                  <h3 className="text-lg font-semibold text-white mb-4">Intención de Voto - Inicial vs Final</h3>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={voteIntentionData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis type="number" stroke="#9ca3af" fontSize={12} domain={[0, 50]} />
                        <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} width={60} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1a1a2e',
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="initial" fill="#666666" name="Inicial %" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="final" name="Final %" radius={[0, 4, 4, 0]}>
                          {voteIntentionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="p-5">
                  <h3 className="text-lg font-semibold text-white mb-4">Impacto por Sector</h3>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sectorImpactData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} />
                        <YAxis stroke="#9ca3af" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1a1a2e',
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="happiness" fill="#22c55e" name="Cambio Felicidad" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </>
          )}

          {/* Empty State */}
          {!hasRun && (
            <Card className="p-12 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-dashed border-gray-600">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-white mb-2">Sandbox de Simulación</h3>
              <p className="text-gray-400 text-center max-w-md mb-6">
                Selecciona una política pública y ejecuta la simulación para ver cómo afectaría
                a la población sintética de Hermosillo en diferentes horizontes de tiempo.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Listo para simular</span>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default ABMSimulator;