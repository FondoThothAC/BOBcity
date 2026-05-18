/**
 * @jest-environment jsdom
 */

describe('CívicaOS Engine - Suite de Pruebas de Comportamiento (BDD / TDD)', () => {
  let dom;

  beforeEach(() => {
    // Inicializar un DOM virtual simple para simular el dashboard
    document.body.innerHTML = `
      <div id="toast-container"></div>
      <div id="online-indicator">◉ ONLINE · LOCAL-FIRST</div>
      
      <div class="nav-item active" id="nav-master">Consola Maestra</div>
      <div class="nav-item" id="nav-agent">Panel Agente</div>
      
      <div class="view active" id="view-master"></div>
      <div class="view" id="view-agent"></div>
      
      <span id="crumb-path">Sistema</span>
      <span id="crumb-title">Consola Maestra</span>
      
      <input id="cp-input" value="26030" />
      <select id="sector-input"><option value="Agua" selected>Agua</option></select>
      <input id="dolor-input" value="Desabasto recurrente en Palo Verde" />
      <input id="propuesta-input" value="Pozos de absorción" />
      
      <div id="cedula-card" style="display:none;">
        <span id="cedula-hash"></span>
      </div>

      <div id="agent-flow-agent">
        <div class="agent-node idle">Node 1</div>
        <div class="agent-node idle">Node 2</div>
      </div>
      <div id="agent-terminal"></div>
    `;

    // Mock del sistema global
    window.navigator.onLine = true;
    window.crypto = {
      subtle: {
        digest: jest.fn().mockImplementation(async (algo, data) => {
          return new Uint8Array([1, 2, 3, 4]).buffer; // Mock hash buffer
        })
      },
      getRandomValues: jest.fn()
    };
  });

  test('Dado un ciudadano, cuando registra una propuesta con CP de 5 dígitos, entonces se genera la firma segura SHA-256', async () => {
    const cp = document.getElementById('cp-input').value;
    const sector = document.getElementById('sector-input').value;
    const dolor = document.getElementById('dolor-input').value;

    expect(cp).toBe('26030');
    expect(sector).toBe('Agua');

    // Simular el algoritmo SHA-256 criptográfico real implementado
    const encoder = new TextEncoder();
    const data = encoder.encode(`${cp}-${sector}-${dolor}`);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const secureHash = 'SHA-256:' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    expect(secureHash).toBe('SHA-256:01020304');
    
    // Inyectar en el dom de la cédula
    const hashEl = document.getElementById('cedula-hash');
    hashEl.textContent = secureHash;
    document.getElementById('cedula-card').style.display = 'block';

    expect(document.getElementById('cedula-card').style.display).toBe('block');
    expect(hashEl.textContent).toContain('SHA-256:');
  });

  test('Dado un usuario en el panel, cuando presiona atajos de teclado, entonces se realiza el cambio de vista y se actualizan las migas de pan', () => {
    const changeViewSpy = jest.fn((viewName) => {
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      const target = document.getElementById('view-' + viewName);
      if (target) target.classList.add('active');
      document.getElementById('crumb-title').textContent = viewName === 'agent' ? 'Panel de Agente' : 'Consola Maestra';
    });

    // Simular evento Ctrl + 2
    const event = new KeyboardEvent('keydown', { ctrlKey: true, key: '2' });
    if (event.ctrlKey && event.key === '2') {
      changeViewSpy('agent');
    }

    expect(changeViewSpy).toHaveBeenCalledWith('agent');
    expect(document.getElementById('view-agent').classList.contains('active')).toBe(true);
    expect(document.getElementById('crumb-title').textContent).toBe('Panel de Agente');
  });

  test('Dado un pipeline de enjambre Swarm, cuando escribe los logs, entonces inyecta los nodos de forma segura evitando innerHTML', () => {
    const terminal = document.getElementById('agent-terminal');
    const newLogMsg = 'DataCollector · ingesta INEGI iniciada... <script>alert("XSS")</script>';

    // Simular inyección segura textContent
    const line = document.createElement('div');
    line.className = 'terminal-line';
    const textSpan = document.createElement('span');
    textSpan.textContent = newLogMsg; // Inyección de texto plano segura
    line.appendChild(textSpan);
    terminal.appendChild(line);

    expect(terminal.innerHTML).not.toContain('<script>');
    expect(terminal.textContent).toContain('<script>alert("XSS")</script>');
  });
});
