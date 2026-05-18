import { useState, useMemo } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Card, Badge } from '@/components/ui';
import type { CandidateProfile } from '@/models/dataModel';
import { MOCK_CANDIDATES, DISTRICT_CONTEXT, HERMOSILLO_DISTRICTS, ELECTORAL_HISTORY } from '@/models/mockData';
import { calculateWinProbability, compareCandidates } from '@/models/abmEngine';

// ============================================================
// Profile Type Labels
// ============================================================

const PROFILE_TYPE_LABELS: Record<CandidateProfile['profileType'], string> = {
  'loyal_official': 'Funcionario Leal',
  'young_rebel': 'Joven Rebelde',
  'pragmatic_business': 'Empresario Pragmático',
  'rights_lawyer': 'Abogado de Derechos',
  'technocrat': 'Tecnocrata',
  'veteran_political': 'Veterano Político'
};

const EDUCATION_LABELS: Record<CandidateProfile['education'], string> = {
  'high_school': 'Preparatoria',
  'bachelor': 'Licenciatura',
  'master': 'Maestría',
  'doctorate': 'Doctorado'
};

// ============================================================
// PredictorEngine Component
// ============================================================

export function PredictorEngine() {
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>(['cand_001', 'cand_002']);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('district_2');
  const [viewMode, setViewMode] = useState<'radar' | 'bars' | 'history'>('radar');

  // Get candidates data
  const candidates = useMemo(() => {
    return MOCK_CANDIDATES.filter(c => selectedCandidates.includes(c.id));
  }, [selectedCandidates]);

  // Get district context
  const districtContext = useMemo(() => {
    return DISTRICT_CONTEXT[selectedDistrict];
  }, [selectedDistrict]);

  // Calculate probabilities for each candidate
  const predictions = useMemo(() => {
    return candidates.map(candidate => {
      const result = calculateWinProbability(candidate, districtContext);
      return {
        candidate,
        probability: result.probability,
        confidence: result.confidence,
        factors: result.factors
      };
    }).sort((a, b) => b.probability - a.probability);
  }, [candidates, districtContext]);

  // Head-to-head comparison if 2 candidates
  const headToHead = useMemo(() => {
    if (candidates.length === 2) {
      return compareCandidates(candidates[0], candidates[1], districtContext);
    }
    return null;
  }, [candidates, districtContext]);

  // Radar chart data
  const radarData = useMemo(() => {
    if (candidates.length === 0) return [];

    const dimensions = [
      { key: 'experience', label: 'Experiencia' },
      { key: 'education', label: 'Educación' },
      { key: 'loyalty', label: 'Lealtad' },
      { key: 'profile', label: 'Perfil' },
      { key: 'security', label: 'Seguridad' },
      { key: 'economic', label: 'Economía' }
    ];

    return dimensions.map(dim => {
      const dataPoint: Record<string, number | string> = { dimension: dim.label };

      candidates.forEach(candidate => {
        let value = 0;

        switch (dim.key) {
          case 'experience':
            value = Math.min(100, (candidate.experience.government / 20) * 100);
            break;
          case 'education':
            const eduMap = { high_school: 25, bachelor: 50, master: 75, doctorate: 100 };
            value = eduMap[candidate.education];
            break;
          case 'loyalty':
            value = candidate.partyLoyalty;
            break;
          case 'profile':
            value = candidate.profileType === 'young_rebel' || candidate.profileType === 'technocrat' ? 80 : 60;
            break;
          case 'security':
            value = candidate.hasSecurityBackground ? 100 : 30;
            break;
          case 'economic':
            value = candidate.experience.private_sector > 10 ? 80 : 40;
            break;
        }

        dataPoint[candidate.name.split(' ').slice(-1)[0]] = value;
      });

      return dataPoint;
    });
  }, [candidates]);

  // Historical trend data
  const historicalData = useMemo(() => {
    return ELECTORAL_HISTORY.map(election => ({
      name: new Date(election.date).getFullYear().toString(),
      morena: election.results.find(r => r.party === 'MORENA')?.percentage || 0,
      pan: election.results.find(r => r.party === 'PAN')?.percentage || 0,
      pri: election.results.find(r => r.party === 'PRI')?.percentage || 0,
      other: election.results.find(r => !['MORENA', 'PAN', 'PRI'].includes(r.party))?.percentage || 0
    }));
  }, []);

  const COLORS = ['#00ff88', '#00aaff', '#ff6600', '#888888'];

  const toggleCandidate = (candidateId: string) => {
    setSelectedCandidates(prev => {
      if (prev.includes(candidateId)) {
        if (prev.length > 1) {
          return prev.filter(id => id !== candidateId);
        }
        return prev;
      } else {
        if (prev.length < 3) {
          return [...prev, candidateId];
        }
        return prev;
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Motor de Predicción Electoral</h2>
          <p className="text-gray-400">Análisis predictivo con modelos de Deep Learning</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="info" className="px-3 py-1">
            {new Date().toLocaleDateString('es-MX')}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Controls Panel */}
        <div className="xl:col-span-1 space-y-4">
          {/* District Selection */}
          <Card className="p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Distrito de Análisis</h3>
            <select
              value={selectedDistrict}
              onChange={e => setSelectedDistrict(e.target.value)}
              className="w-full bg-black/30 border border-white/20 rounded-lg p-3 text-white"
            >
              {HERMOSILLO_DISTRICTS.map(district => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </select>

            {/* District Context */}
            <div className="mt-4 p-3 bg-black/20 rounded-lg space-y-2">
              <p className="text-xs text-gray-400 uppercase">Contexto del Distrito</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Pobreza:</span>
                  <span className="text-amber-400">{(districtContext.povertyRate * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Violencia:</span>
                  <span className="text-red-400">{districtContext.violenceRate}/100k</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Educación:</span>
                  <span className="text-blue-400">{(districtContext.educationLevel * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Desempleo:</span>
                  <span className="text-amber-400">{districtContext.unemploymentRate}%</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Candidate Selection */}
          <Card className="p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Candidatos</h3>
            <div className="space-y-3">
              {MOCK_CANDIDATES.map(candidate => (
                <button
                  key={candidate.id}
                  onClick={() => toggleCandidate(candidate.id)}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    selectedCandidates.includes(candidate.id)
                      ? 'bg-emerald-500/20 border border-emerald-500'
                      : 'bg-black/20 border border-white/10 hover:border-emerald-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium text-sm">{candidate.name}</p>
                      <p className="text-gray-400 text-xs">{candidate.party}</p>
                    </div>
                    {selectedCandidates.includes(candidate.id) && (
                      <Badge variant="success" className="text-xs">✓</Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* View Mode Toggle */}
          <Card className="p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Modo de Vista</h3>
            <div className="grid grid-cols-3 gap-2">
              {(['radar', 'bars', 'history'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`p-2 rounded-lg text-xs font-medium transition-all ${
                    viewMode === mode
                      ? 'bg-emerald-500 text-white'
                      : 'bg-black/30 text-gray-400 hover:bg-emerald-500/20'
                  }`}
                >
                  {mode === 'radar' ? 'Radar' : mode === 'bars' ? 'Barras' : 'Historial'}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="xl:col-span-3 space-y-6">
          {/* Prediction Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predictions.map((pred, index) => (
              <Card
                key={pred.candidate.id}
                className={`p-5 ${
                  index === 0
                    ? 'bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border-2 border-emerald-500'
                    : 'bg-gradient-to-br from-gray-900/50 to-gray-800/50'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Badge
                      variant={index === 0 ? 'success' : 'default'}
                      className="mb-2"
                    >
                      #{index + 1} Favorito
                    </Badge>
                    <h4 className="text-white font-semibold">{pred.candidate.name}</h4>
                    <p className="text-gray-400 text-sm">{pred.candidate.party}</p>
                  </div>
                </div>

                {/* Probability Gauge */}
                <div className="mb-4">
                  <div className="flex items-end justify-between mb-1">
                    <span className="text-gray-400 text-sm">Probabilidad de Victoria</span>
                    <span className={`text-2xl font-bold ${
                      pred.probability >= 60 ? 'text-emerald-400' :
                      pred.probability >= 40 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {pred.probability.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-700/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        pred.probability >= 60 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                        pred.probability >= 40 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                        'bg-gradient-to-r from-red-500 to-rose-500'
                      }`}
                      style={{ width: `${pred.probability}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Rango: {pred.confidence[0].toFixed(0)}% - {pred.confidence[1].toFixed(0)}%
                  </p>
                </div>

                {/* Key Factors */}
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 uppercase">Factores Clave</p>
                  {pred.factors.slice(0, 3).map((factor, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{factor.name}</span>
                      <span className={factor.contribution > 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {factor.contribution > 0 ? '+' : ''}{factor.contribution.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>

                {/* Candidate Info */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Perfil:</span>
                      <span className="text-gray-300 ml-1">
                        {PROFILE_TYPE_LABELS[pred.candidate.profileType]}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Edad:</span>
                      <span className="text-gray-300 ml-1">{pred.candidate.age}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Educación:</span>
                      <span className="text-gray-300 ml-1">
                        {EDUCATION_LABELS[pred.candidate.education]}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Lealtad:</span>
                      <span className="text-gray-300 ml-1">{pred.candidate.partyLoyalty}%</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Head-to-Head Comparison */}
          {headToHead && (
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Comparativa Head-to-Head</h3>
                <Badge variant="info">Duelo Electoral</Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-4 bg-black/20 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">{candidates[0].name.split(' ').slice(-2).join(' ')}</p>
                  <p className="text-3xl font-bold text-blue-400">
                    {predictions[0].probability.toFixed(0)}%
                  </p>
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">vs</p>
                    <p className="text-xl font-bold text-white">
                      {headToHead.margin.toFixed(1)}pp
                    </p>
                  </div>
                </div>
                <div className="text-center p-4 bg-black/20 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">{candidates[1].name.split(' ').slice(-2).join(' ')}</p>
                  <p className="text-3xl font-bold text-emerald-400">
                    {predictions[1].probability.toFixed(0)}%
                  </p>
                </div>
              </div>

              <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                <p className="text-emerald-300 text-sm">
                  <strong>Análisis:</strong> {headToHead.analysis}
                </p>
              </div>
            </Card>
          )}

          {/* Charts */}
          <Card className="p-5">
            <h3 className="text-lg font-semibold text-white mb-4">
              {viewMode === 'radar' ? 'Perfil Comparativo' :
               viewMode === 'bars' ? 'Factores de Éxito' : 'Historial Electoral'}
            </h3>

            <div className="h-[350px]">
              {viewMode === 'radar' && (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="dimension" stroke="#9ca3af" fontSize={12} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#9ca3af" fontSize={10} />
                    <Radar
                      name={candidates[0]?.name.split(' ').slice(-1)[0] || 'C1'}
                      dataKey={candidates[0]?.name.split(' ').slice(-1)[0] || ''}
                      stroke="#00aaff"
                      fill="#00aaff"
                      fillOpacity={0.3}
                    />
                    {candidates[1] && (
                      <Radar
                        name={candidates[1]?.name.split(' ').slice(-1)[0] || 'C2'}
                        dataKey={candidates[1]?.name.split(' ').slice(-1)[0] || ''}
                        stroke="#00ff88"
                        fill="#00ff88"
                        fillOpacity={0.3}
                      />
                    )}
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a2e',
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              )}

              {viewMode === 'bars' && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={predictions.flatMap(p => p.factors.slice(0, 4))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a2e',
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="contribution" radius={[4, 4, 0, 0]}>
                      {predictions.flatMap((p, i) =>
                        p.factors.slice(0, 4).map((_, j) => (
                          <Cell key={`${i}-${j}`} fill={i === 0 ? '#00aaff' : '#00ff88'} />
                        ))
                      )}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}

              {viewMode === 'history' && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a2e',
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="morena" stackId="a" fill="#00ff00" name="MORENA" />
                    <Bar dataKey="pan" stackId="a" fill="#0066ff" name="PAN" />
                    <Bar dataKey="pri" stackId="a" fill="#ff6600" name="PRI" />
                    <Bar dataKey="other" stackId="a" fill="#888888" name="Otros" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default PredictorEngine;