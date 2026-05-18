import React, { useState } from 'react';
import { Activity, Map, Cpu, TrendingUp, Server, TerminalSquare } from 'lucide-react';
// Importaciones de los demás componentes...
import OrchestratorConsole from './components/OrchestratorConsole';

export default function App() {
  const = useState('dashboard');

  const navItems =;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Tu código de header existente con navItems.map(...) */}
      
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {activeTab === 'dashboard' && <DashboardOverview />}
        {activeTab === 'gis' && <PainPointsMap />}
        {activeTab === 'abm' && <ABMSimulator />}
        {activeTab === 'predictor' && <PredictorEngine />}
        {activeTab === 'orchestrator' && <OrchestratorConsole />} {/* Render del nuevo componente */}
        {activeTab === 'data' && <DataCenter />}
      </main>
    </div>
  );
}