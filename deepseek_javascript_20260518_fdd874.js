// ✅ MEJORA: Estado centralizado para evitar manipulación directa del DOM
const AppState = {
  currentView: 'master',
  currentNav: null,
  projects: [
    { id: 'HER-DIS-08', name: 'Palo Verde · Hermosillo', package: 'PLATA', 
      agent: 'A. García', status: 'active' },
    { id: 'MOR-SON-2026', name: 'Estado Sonora', package: 'ORO', 
      agent: 'L. Ramírez', status: 'active' },
    { id: 'HER-MUN-01', name: 'Municipio Hermosillo', package: 'BRONCE', 
      agent: 'C. López', status: 'processing' },
    { id: 'GDL-DIS-03', name: 'Zapopan · Jalisco', package: 'PLATA', 
      agent: null, status: 'pending' },
  ],
  agents: [
    { id: 'AG', name: 'Alejandro G.', role: 'Análisis · Sonora', projects: ['HER-DIS-08'], status: 'active' },
    { id: 'LR', name: 'Laura R.', role: 'Estrategia · Sonora', projects: ['MOR-SON-2026'], status: 'active' },
    { id: 'CL', name: 'Carlos L.', role: 'Datos · Jalisco', projects: ['HER-MUN-01'], status: 'processing' },
  ],
  
  addProject(project) {
    this.projects.push(project);
    this.notify('projects');
  },
  
  assignAgent(projectId, agentId) {
    const project = this.projects.find(p => p.id === projectId);
    const agent = this.agents.find(a => a.id === agentId);
    if (project && agent) {
      project.agent = agent.name;
      agent.projects.push(projectId);
      this.notify('projects');
      this.notify('agents');
    }
  },
  
  // Observer pattern simple para actualizar UI
  listeners: {},
  subscribe(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  },
  notify(event) {
    (this.listeners[event] || []).forEach(cb => cb(this));
  }
};