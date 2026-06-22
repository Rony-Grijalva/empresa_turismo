-- =============================================================================
-- SCRIPT DE ESTRUCTURA DE BASE DE DATOS (DDL) - MULTISERVICIOS GRIJALVA (POSTGRESQL)
-- =============================================================================

-- Habilitar extensión para generación de UUIDs si es necesario (gen_random_uuid() es nativo en PG 13+)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Eliminar tablas existentes para garantizar una instalación limpia (orden inverso de dependencias)
DROP TABLE IF EXISTS asignaciones_reserva CASCADE;
DROP TABLE IF EXISTS reportes CASCADE;
DROP TABLE IF EXISTS notificaciones CASCADE;
DROP TABLE IF EXISTS contacto CASCADE;
DROP TABLE IF EXISTS reservas CASCADE;
DROP TABLE IF EXISTS servicios CASCADE;
DROP TABLE IF EXISTS vehiculos CASCADE;
DROP TABLE IF EXISTS conductores CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- Eliminar ENUMs existentes si los hay
DROP TYPE IF EXISTS tipo_rol_usuario CASCADE;
DROP TYPE IF EXISTS estado_vehiculo CASCADE;
DROP TYPE IF EXISTS estado_conductor CASCADE;
DROP TYPE IF EXISTS estado_servicio CASCADE;
DROP TYPE IF EXISTS estado_reserva CASCADE;
DROP TYPE IF EXISTS estado_contacto CASCADE;

-- =============================================================================
-- CREACIÓN DE TIPOS ENUM NATIVOS (POSTGRESQL)
-- =============================================================================
CREATE TYPE tipo_rol_usuario AS ENUM ('ADMIN', 'CLIENTE');
CREATE TYPE estado_vehiculo AS ENUM ('DISPONIBLE', 'EN_RUTA', 'MANTENIMIENTO');
CREATE TYPE estado_conductor AS ENUM ('DISPONIBLE', 'EN_RUTA', 'MANTENIMIENTO');
CREATE TYPE estado_servicio AS ENUM ('ACTIVO', 'INACTIVO');
CREATE TYPE estado_reserva AS ENUM ('PENDIENTE', 'CONFIRMADA', 'RECHAZADA', 'CANCELADA', 'EN_CURSO', 'COMPLETADA');
CREATE TYPE estado_contacto AS ENUM ('PENDIENTE', 'LEIDO', 'RESPONDIDO');

-- =============================================================================
-- FUNCIONES TRIGGER GENERALES
-- =============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- CREACIÓN DE TABLAS
-- =============================================================================

-- 1. TABLA: usuarios
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario VARCHAR(50) UNIQUE NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    rol tipo_rol_usuario NOT NULL DEFAULT 'CLIENTE',
    
    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TRIGGER trg_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();


-- 2. TABLA: conductores
CREATE TABLE conductores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    licencia VARCHAR(30) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    estado estado_conductor NOT NULL DEFAULT 'DISPONIBLE',
    
    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TRIGGER trg_conductores_updated_at
    BEFORE UPDATE ON conductores
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();


-- 3. TABLA: vehiculos
CREATE TABLE vehiculos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placa VARCHAR(10) UNIQUE NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    capacidad INT NOT NULL CHECK (capacidad > 0),
    anio INT NOT NULL CHECK (anio BETWEEN 1900 AND 2100),
    estado estado_vehiculo NOT NULL DEFAULT 'DISPONIBLE',
    
    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TRIGGER trg_vehiculos_updated_at
    BEFORE UPDATE ON vehiculos
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();


-- 4. TABLA: servicios
CREATE TABLE servicios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    tarifa_referencial NUMERIC(10,2) NOT NULL CHECK (tarifa_referencial >= 0.00),
    estado estado_servicio NOT NULL DEFAULT 'ACTIVO',
    
    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TRIGGER trg_servicios_updated_at
    BEFORE UPDATE ON servicios
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();


-- 5. TABLA: reservas
CREATE TABLE reservas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_reserva VARCHAR(20) UNIQUE NOT NULL,
    cliente_id UUID NOT NULL,
    servicio_id UUID NOT NULL,
    fecha_servicio DATE NOT NULL,
    hora_servicio TIME NOT NULL,
    cantidad_pasajeros INT NOT NULL CHECK (cantidad_pasajeros > 0),
    estado_reserva estado_reserva NOT NULL DEFAULT 'PENDIENTE',
    origen VARCHAR(255) NOT NULL,
    destino VARCHAR(255) NOT NULL,
    tarifa_final NUMERIC(10,2) NOT NULL CHECK (tarifa_final >= 0.00),
    notas TEXT,
    
    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Integridad Referencial
    CONSTRAINT fk_reservas_cliente FOREIGN KEY (cliente_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    CONSTRAINT fk_reservas_servicio FOREIGN KEY (servicio_id) REFERENCES servicios(id) ON DELETE RESTRICT
);

CREATE TRIGGER trg_reservas_updated_at
    BEFORE UPDATE ON reservas
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();


-- 6. TABLA: asignaciones_reserva (HISTORIAL DE ASIGNACIONES)
CREATE TABLE asignaciones_reserva (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reserva_id UUID NOT NULL,
    vehiculo_id UUID NOT NULL,
    conductor_id UUID NOT NULL,
    
    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Restricciones de Integridad
    CONSTRAINT fk_asignaciones_reserva FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE CASCADE,
    CONSTRAINT fk_asignaciones_vehiculo FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE RESTRICT,
    CONSTRAINT fk_asignaciones_conductor FOREIGN KEY (conductor_id) REFERENCES conductores(id) ON DELETE RESTRICT,
    
    -- Evitar duplicados de la misma asignación activa
    CONSTRAINT uq_reserva_vehiculo_conductor UNIQUE (reserva_id, vehiculo_id, conductor_id)
);

CREATE TRIGGER trg_asignaciones_reserva_updated_at
    BEFORE UPDATE ON asignaciones_reserva
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();


-- 7. TABLA: notificaciones
CREATE TABLE notificaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    mensaje TEXT NOT NULL,
    leido BOOLEAN NOT NULL DEFAULT FALSE,
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT fk_notificaciones_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);


-- 8. TABLA: reportes
CREATE TABLE reportes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creado_por UUID NOT NULL,
    nombre_reporte VARCHAR(150) NOT NULL,
    tipo_reporte VARCHAR(50) NOT NULL,
    datos JSONB NOT NULL,
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT fk_reportes_usuario FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE RESTRICT
);


-- 9. TABLA: contacto (formulario web)
CREATE TABLE contacto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_completo VARCHAR(150) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    asunto VARCHAR(150) NOT NULL,
    mensaje TEXT NOT NULL,
    estado estado_contacto NOT NULL DEFAULT 'PENDIENTE',
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);


-- =============================================================================
-- INDEXACIÓN DE RENDIMIENTO Y SOFT DELETES
-- =============================================================================

-- Búsqueda de usuarios activos por correo
CREATE UNIQUE INDEX idx_usuarios_correo_activo 
    ON usuarios(correo) 
    WHERE (deleted_at IS NULL);

-- Búsquedas/filtros frecuentes
CREATE INDEX idx_reservas_codigo ON reservas(codigo_reserva);
CREATE INDEX idx_reservas_fecha ON reservas(fecha_servicio);
CREATE INDEX idx_reservas_estado ON reservas(estado_reserva);
CREATE INDEX idx_reservas_cliente ON reservas(cliente_id);

-- Soft Delete Indexes (para optimizar consultas que filtran registros activos)
CREATE INDEX idx_usuarios_deleted_at ON usuarios(deleted_at) WHERE (deleted_at IS NULL);
CREATE INDEX idx_conductores_deleted_at ON conductores(deleted_at) WHERE (deleted_at IS NULL);
CREATE INDEX idx_vehiculos_deleted_at ON vehiculos(deleted_at) WHERE (deleted_at IS NULL);
CREATE INDEX idx_reservas_deleted_at ON reservas(deleted_at) WHERE (deleted_at IS NULL);

-- Asignaciones de recursos
CREATE INDEX idx_asignaciones_reserva ON asignaciones_reserva(reserva_id);
CREATE INDEX idx_asignaciones_vehiculo ON asignaciones_reserva(vehiculo_id);
CREATE INDEX idx_asignaciones_conductor ON asignaciones_reserva(conductor_id);

-- Notificaciones pendientes
CREATE INDEX idx_notificaciones_usuario_no_leido 
    ON notificaciones(usuario_id) 
    WHERE (leido = FALSE);
