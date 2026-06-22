-- =============================================================================
-- SCRIPT DE INSERCIÓN DE DATOS DE PRUEBA (DML) - MULTISERVICIOS GRIJALVA
-- =============================================================================

-- Limpieza de registros previos (por integridad referencial)
TRUNCATE TABLE contacto, reportes, notificaciones, asignaciones_reserva, reservas, servicios, vehiculos, conductores, usuarios CASCADE;

-- 1. USUARIOS (Contraseñas con hash simulado)
INSERT INTO usuarios (id, usuario, nombre_completo, correo, telefono, password_hash, rol)
VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin_grijalva', 'Administrador Grijalva', 'admin@grijalva.pe', '987654321', '$2a$10$uA3fG.8n7t7k3k4k7k3k8e.l8m8s8f8c8v8e8r8y8t8h8r8d8m8g8', 'ADMIN'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'rony_cliente', 'Rony Meléndez', 'rony@correo.com', '912345678', '$2a$10$uA3fG.8n7t7k3k4k7k3k8e.l8m8s8f8c8v8e8r8y8t8h8r8d8m8g8', 'CLIENTE'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'empresa_abc', 'Representante ABC S.A.C.', 'contacto@empresaabc.pe', '014445555', '$2a$10$uA3fG.8n7t7k3k4k7k3k8e.l8m8s8f8c8v8e8r8y8t8h8r8d8m8g8', 'CLIENTE');

-- 2. CONDUCTORES
INSERT INTO conductores (id, nombre, licencia, telefono, estado)
VALUES
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d11', 'Carlos Mendoza', 'A-IIIc-987654', '987654321', 'DISPONIBLE'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d22', 'José Flores', 'A-IIIa-123456', '951847263', 'EN_RUTA');

-- 3. VEHÍCULOS
INSERT INTO vehiculos (id, placa, modelo, capacidad, anio, estado)
VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'F3G-852', 'Hyundai H350 (Van)', 15, 2022, 'DISPONIBLE'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'B5D-961', 'Toyota Hiace (Minivan)', 12, 2023, 'EN_RUTA');

-- 4. SERVICIOS
INSERT INTO servicios (id, nombre, descripcion, tarifa_referencial, estado)
VALUES
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e11', 'Transporte Turístico', 'Traslados cómodos a centros arqueológicos, museos, playas y paseos recreacionales.', 250.00, 'ACTIVO'),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e22', 'Transporte de Personal', 'Servicio diario de ida y vuelta para trabajadores de empresas privadas e industrias.', 200.00, 'ACTIVO');

-- 5. RESERVAS
INSERT INTO reservas (id, codigo_reserva, cliente_id, servicio_id, fecha_servicio, hora_servicio, cantidad_pasajeros, estado_reserva, origen, destino, tarifa_final, notas)
VALUES
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f11', 'MSG-202601', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e11', '2026-07-15', '08:00:00', 10, 'CONFIRMADA', 'Av. Aviación 1230, San Borja', 'Ruinas de Pachacamac, Lurín', 260.00, 'Llevar cooler para agua.'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f22', 'MSG-202602', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e22', '2026-07-20', '07:00:00', 8, 'EN_CURSO', 'Plaza San Martín, Centro de Lima', 'Sede Industrial, Lurín', 210.00, 'Puntualidad en el recojo del personal.');

-- 6. ASIGNACIONES DE RECURSOS A LAS RESERVAS (DESACOPLADO)
INSERT INTO asignaciones_reserva (id, reserva_id, vehiculo_id, conductor_id)
VALUES
('90eebc99-9c0b-4ef8-bb6d-6bb9bd380911', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d11'),
('90eebc99-9c0b-4ef8-bb6d-6bb9bd380922', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f22', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d22');

-- 7. NOTIFICACIONES
INSERT INTO notificaciones (id, usuario_id, titulo, mensaje, leido)
VALUES
('80eebc99-9c0b-4ef8-bb6d-6bb9bd380811', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Reserva Confirmada', 'Tu reserva MSG-202601 ha sido confirmada con éxito.', false),
('80eebc99-9c0b-4ef8-bb6d-6bb9bd380822', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Nueva Reserva Recibida', 'El cliente Rony Meléndez ha registrado una nueva reserva MSG-202601.', true);

-- 8. REPORTES (JSONB nativo)
INSERT INTO reportes (id, creado_por, nombre_reporte, tipo_reporte, datos)
VALUES
('70eebc99-9c0b-4ef8-bb6d-6bb9bd380711', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Reporte Mensual de Reservas - Junio 2026', 'SERVICIOS', '{"total_reservas": 15, "completadas": 12, "canceladas": 3, "ingresos_soles": 4500.00}'),
('70eebc99-9c0b-4ef8-bb6d-6bb9bd380722', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Uso y Mantenimiento de Flota - Junio 2026', 'FLOTA', '{"vehiculos_activos": 3, "en_mantenimiento": 1, "kilometros_recorridos": 1200}');

-- 9. CONTACTO
INSERT INTO contacto (id, nombre_completo, correo, telefono, asunto, mensaje, estado)
VALUES
('10eebc99-9c0b-4ef8-bb6d-6bb9bd380111', 'Maria Julia Torres', 'mj.torres@corporativo.com', '999888777', 'Cotización Servicio Escolar', 'Buenas tardes, quisiera cotizar la movilidad mensual para 18 alumnos desde Surco a Chorrillos.', 'PENDIENTE'),
('10eebc99-9c0b-4ef8-bb6d-6bb9bd380222', 'Juan Pérez', 'juan.perez@gmail.com', '987123456', 'Felicitación de Servicio', 'Excelente atención en nuestro viaje familiar del fin de semana pasado.', 'LEIDO');
