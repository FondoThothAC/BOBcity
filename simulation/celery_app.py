import os
from celery import Celery

# Usamos SQLite como Broker y Backend para no depender de Redis/Docker localmente
# Esto es ideal para un entorno "Zero-Trust Local Orchestrator"
broker_url = 'sqla+sqlite:///celery_broker.sqlite'
result_backend = 'db+sqlite:///celery_results.sqlite'

app = Celery(
    'civicaos_tasks',
    broker=broker_url,
    backend=result_backend,
    include=['tasks']
)

# Configuraciones adicionales
app.conf.update(
    task_serializer='json',
    accept_content=['json'],  
    result_serializer='json',
    timezone='America/Mexico_City',
    enable_utc=True,
)

if __name__ == '__main__':
    app.start()
