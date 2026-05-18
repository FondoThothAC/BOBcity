#!/usr/bin/env python3
# migration_initial.py - Alembic-style migration

# Revision ID: 001
# Create Date: 2026-05-17

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Enable extensions
    op.execute('CREATE EXTENSION IF NOT EXISTS postgis')
    op.execute('CREATE EXTENSION IF NOT EXISTS pgvector')
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    # Create tables
    op.create_table(
        'territorios',
        sa.Column('id', sa.String(10), primary_key=True),
        sa.Column('tipo', sa.String(20), nullable=False),
        sa.Column('nombre', sa.String(100), nullable=False),
        sa.Column('padre_id', sa.String(10), sa.ForeignKey('territorios.id')),
        sa.Column('geometria', sa.String()),
        sa.Column('poblacion_total', sa.Integer, default=0),
        sa.Column('pobreza_pct', sa.Numeric(5,2)),
        sa.Column('analfabetismo_pct', sa.Numeric(5,2)),
        sa.Column('ingreso_medio_mensual', sa.Numeric(10,2)),
        sa.Column('tasa_homicidios', sa.Numeric(5,2)),
        sa.Column('desercion_escolar_pct', sa.Numeric(5,2)),
        sa.Column('conectividad_internet_pct', sa.Numeric(5,2)),
        sa.Column('ultimo_ganador_partido', sa.String(50)),
        sa.Column('ultimo_margen_victoria_pct', sa.Numeric(5,2)),
        sa.Column('volatilidad_historica', sa.Numeric(5,2)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )

    op.create_table(
        'agentes_sector',
        sa.Column('id', postgresql.UUID, primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('territorio_id', sa.String(10), sa.ForeignKey('territorios.id'), nullable=False),
        sa.Column('tipo', sa.String(30), nullable=False),
        sa.Column('poblacion_sintetica', sa.Integer, default=1000),
        sa.Column('ingreso_promedio', sa.Numeric(10,2), default=15000),
        sa.Column('educacion_promedio', sa.Numeric(4,1), default=12.0),
        sa.Column('edad_promedio', sa.Numeric(4,1), default=35.0),
        sa.Column('felicidad_base', sa.Numeric(5,2), default=50.0),
        sa.Column('confianza_institucional', sa.Numeric(5,2), default=50.0),
        sa.Column('prioridad_seguridad', sa.Numeric(5,2), default=20.0),
        sa.Column('prioridad_economia', sa.Numeric(5,2), default=20.0),
        sa.Column('prioridad_empleo', sa.Numeric(5,2), default=20.0),
        sa.Column('prioridad_transporte', sa.Numeric(5,2), default=20.0),
        sa.Column('prioridad_salud', sa.Numeric(5,2), default=20.0),
        sa.Column('felicidad_actual', sa.Numeric(5,2), default=50.0),
        sa.Column('confianza_actual', sa.Numeric(5,2), default=50.0),
        sa.Column('ingreso_actual', sa.Numeric(10,2), default=15000),
        sa.Column('intencion_voto', postgresql.JSONB, default='{}'),
        sa.Column('estado', sa.String(20), default='normal'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )

    # Add indexes
    op.create_index('idx_territorios_tipo', 'territorios', ['tipo'])
    op.create_index('idx_territorios_padre', 'territorios', ['padre_id'])
    op.create_index('idx_agentes_territorio', 'agentes_sector', ['territorio_id'])
    op.create_index('idx_agentes_tipo', 'agentes_sector', ['tipo'])

def downgrade():
    op.drop_table('agentes_sector')
    op.drop_table('territorios')
