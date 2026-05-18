// /tests/ui/dashboard.test.js
// Tests con Jest + Testing Library

import { describe, test, expect, beforeEach } from '@jest/globals';

describe('CívicaOS Dashboard', () => {
  
  // TDD: Test primero, luego implementación
  describe('Navegación', () => {
    test('Debe cambiar a vista de agente al hacer clic en nav-item correspondiente', () => {
      document.body.innerHTML = getDashboardHTML();
      const agentNav = document.querySelector('.nav-item:nth-child(2)');
      
      agentNav.click();
      
      const agentView = document.getElementById('view-agent');
      expect(agentView.classList.contains('active')).toBe(true);
      expect(document.getElementById('view-master').classList.contains('active')).toBe(false);
    });
    
    test('Debe actualizar el breadcrumb al cambiar de vista', () => {
      document.body.innerHTML = getDashboardHTML();
      
      setView('predictor');
      
      expect(document.getElementById('crumb-title').textContent).toBe('Predictor Electoral');
      expect(document.getElementById('crumb-path').textContent).toBe('Módulos');
    });
  });
  
  // BDD: Comportamiento del usuario
  describe('ThothAgora - Captura Ciudadana (BDD)', () => {
    test('Dado un ciudadano que completa el formulario, cuando envía, entonces genera cédula digital', () => {
      // Given
      document.body.innerHTML = getDashboardHTML();
      setView('citizen');
      document.getElementById('cp-input').value = '83200';
      document.getElementById('sector-input').value = 'Comerciante';
      document.getElementById('dolor-input').value = 'Agua / suministro';
      document.getElementById('propuesta-input').value = 'Mejorar tuberías';
      
      // When
      submitCitizen();
      
      // Then
      const cedula = document.getElementById('cedula-card');
      expect(cedula.style.display).toBe('block');
      const hash = document.getElementById('cedula-hash').textContent;
      expect(hash).toMatch(/^SHA-256:[a-f0-9]{64}$/);
    });
    
    test('No debe generar cédula si faltan campos requeridos', () => {
      // Given
      document.body.innerHTML = getDashboardHTML();
      setView('citizen');
      // Campos vacíos
      
      // When
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
      submitCitizen();
      
      // Then
      expect(alertMock).toHaveBeenCalledWith(expect.stringContaining('completa'));
      expect(document.getElementById('cedula-card').style.display).toBe('none');
    });
  });
  
  // ATDD: Criterios de aceptación del inversor
  describe('Criterios de Aceptación (ATDD)', () => {
    test('El predictor debe responder en menos de 2 segundos', async () => {
      const start = performance.now();
      calcPredictor();
      const end = performance.now();
      
      expect(end - start).toBeLessThan(2000);
    });
    
    test('El dashboard debe mostrar al menos 5 stat cards en vista master', () => {
      document.body.innerHTML = getDashboardHTML();
      setView('master');
      
      const statCards = document.querySelectorAll('#view-master .stat-card');
      expect(statCards.length).toBeGreaterThanOrEqual(5);
    });
    
    test('El heatmap debe tener 100 celdas (10x10)', () => {
      document.body.innerHTML = getDashboardHTML();
      setView('client');
      renderHeatmap();
      
      const cells = document.querySelectorAll('.heat-cell');
      expect(cells.length).toBe(100);
    });
  });
  
  // Security-Driven: Sin vulnerabilidades XSS
  describe('Seguridad (SDD)', () => {
    test('No debe ejecutar scripts inyectados en inputs', () => {
      document.body.innerHTML = getDashboardHTML();
      setView('citizen');
      
      const maliciousInput = '<img src=x onerror=alert("XSS")>';
      document.getElementById('cp-input').value = maliciousInput;
      
      // El valor sanitizado no debe contener HTML ejecutable
      const sanitized = sanitizeInput(maliciousInput);
      expect(sanitized).not.toContain('<img');
      expect(sanitized).not.toContain('onerror');
    });
    
    test('El hash debe generarse con crypto.getRandomValues, no Math.random', () => {
      const hash = generateSecureHash();
      expect(hash).toMatch(/^SHA-256:[a-f0-9]{64}$/);
      // Verificar que usa crypto, no Math.random
      const mathRandomSpy = jest.spyOn(Math, 'random');
      generateSecureHash();
      expect(mathRandomSpy).not.toHaveBeenCalled();
    });
  });
});