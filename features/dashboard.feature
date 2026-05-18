# language: es
Característica: Dashboard Engine CívicaOS

  Como administrador electoral o estratega político
  Quiero acceder a una interfaz glassmorphism local-first y segura
  Para capturar gemelos cívicos, predecir duelos electorales y gestionar agentes cognitivos

  @security
  Escenario: Captura de Gemelo Cívico con Hashing Criptográfico SHA-256
    Dado que el ciudadano está en el portal "ThothAgora"
    Y ingresa un código postal "26030" válido de 5 dígitos
    Y selecciona el sector "Agua" y describe el dolor "Desabasto recurrente en Palo Verde"
    Cuando hace clic en "Registrar Propuesta"
    Entonces el sistema genera una firma criptográfica real SHA-256
    Y muestra la cédula de gemelo cívico con la firma generada
    Y notifica con un mensaje "Cédula de Gemelo Cívico generada con éxito."

  @navigation
  Escenario: Navegación de vistas fluida por teclado
    Dado que el usuario está visualizando el dashboard de CívicaOS
    Cuando presiona la combinación de teclas "Ctrl + 2"
    Entonces el sistema cambia la vista activa al "Panel de Agente"
    Y muestra la ruta de migas de pan correspondiente

  @integration
  Escenario: Simulación de enjambre de agentes sin vulnerabilidades XSS
    Dado que el agente inicia el pipeline en "Swarm OpenClaw"
    Cuando se ejecutan los pasos y se escriben los logs en la terminal
    Entonces todos los registros se inyectan de forma segura evitando innerHTML
    Y se muestra un toast indicando "Pipeline de enjambre completado. Plan consolidado."
