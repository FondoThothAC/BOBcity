# features/electoral-prediction.feature
# language: es
Característica: Predicción de Comportamiento Electoral y Opinión Pública
  Como director de campaña y estratega político
  Quiero simular dinámicas de opinión social y probabilidades de voto
  Para optimizar la agenda de propuestas legislativas locales

  Escenario: Evaluación de impacto de propuestas en el Distrito 8 (Sur)
    Dado un distrito "Hermosillo D8" con índice socioeconómico moderado
    Y un candidato con propuesta de "Red de Pozos Comunitarios"
    Cuando ejecuto el simulador híbrido con umbral de confianza de opinion epsilon 0.3
    Entonces la opinión de los agentes sintéticos converge en 3 clusters principales
    Y la probabilidad de voto a favor calculada por el modelo Logit Softmax es superior al 60%
    Y los logs de auditoría confirman que el procesamiento se realizó con conformidad Zero-Trust
