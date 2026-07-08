# Multiservicios Grijalva — Sistema de Gestión de Reservas

Sistema web integral para digitalizar y automatizar la gestión de reservas de transporte de la empresa **Multiservicios Grijalva S.A.C.** (transporte turístico, escolar, de personal y corporativo).

Antes, la operación se llevaba de forma manual (WhatsApp, llamadas y papel), lo que causaba pérdida de información, cruces de horario y errores en las reservas. Este sistema centraliza el proceso en una plataforma web con tres componentes: un **sitio público** para clientes, un **panel administrativo** para la operación y una **API REST** que los conecta con la base de datos.

---

## Índice

1. [Características principales](#características-principales)
2. [Arquitectura](#arquitectura)
3. [Stack tecnológico](#stack-tecnológico)
4. [Estructura del proyecto](#estructura-del-proyecto)
5. [Módulos del backend](#módulos-del-backend)
6. [API REST](#api-rest)
7. [Frontend público](#frontend-público)
8. [Panel administrativo](#panel-administrativo)
9. [Reglas de negocio](#reglas-de-negocio)
10. [Requisitos previos](#requisitos-previos)
11. [Instalación y ejecución local](#instalación-y-ejecución-local)
12. [Variables de entorno](#variables-de-entorno)
13. [Pruebas automatizadas](#pruebas-automatizadas)
14. [Despliegue](#despliegue)
15. [Credenciales de demostración](#credenciales-de-demostración)

---

## Características principales

- **Catálogo de servicios** consultable por el cliente.
- **Registro de reservas online** con generación de un **código de seguimiento único** (formato `MG-AAAA-NNNN`).
- **Correo de confirmación automático** al registrar la reserva.
- **Seguimiento público** del estado de la reserva por código, sin necesidad de cuenta.
- **Consentimiento de datos** (Ley N.° 29733) obligatorio en el formulario.
- **Panel administrativo** con gestión de reservas, flota, conductores, servicios y mensajes de contacto.
- **Asignación de recursos** con validación de **aforo** (pasajeros ≤ asientos) y de **cruce de horarios**.
- **Tablero de indicadores** (viajes e ingresos del mes) y exportación de reportes a CSV.
- **Control de mantenimiento preventivo** de la flota por kilometraje.
- Autenticación por **JWT** y control de acceso por roles.

---

## Arquitectura

Monorepo con tres componentes desplegables de forma independiente:

```
  Cliente (navegador)                 Administrador (navegador)
        │                                      │
        ▼                                      ▼
  ┌───────────────┐                    ┌───────────────┐
  │  frontend     │                    │  admin-panel  │
  │  React + Vite │                    │  React + Vite │
  └───────┬───────┘                    └───────┬───────┘
          │            HTTP / REST (JSON)       │
          └───────────────┬────────────────────┘
                          ▼
                 ┌──────────────────┐
                 │     backend      │
                 │  Django + Ninja  │  ── SMTP (correo de confirmación)
                 │   (API REST)     │
                 └────────┬─────────┘
                          ▼
                  ┌───────────────┐
                  │  PostgreSQL   │
                  └───────────────┘
```

El backend sigue el patrón **MVT** de Django y expone la API con **Django Ninja**. Los dos frontends consumen esa API por HTTP.

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Backend | Python 3.11+, Django 5.x, Django Ninja, Ninja JWT |
| Base de datos | PostgreSQL |
| Frontend público | React 19, Vite, React Router, Tailwind CSS, Axios |
| Panel administrativo | React 19, Vite, Tailwind CSS, Recharts, Axios |
| Pruebas | pytest, pytest-django |
| Servidor de estáticos | WhiteNoise |
| Despliegue | Vercel (frontends) · Render (backend + base de datos) |

---

## Estructura del proyecto

```
empresa_turismo/
├── backend/                 # API REST (Django + Django Ninja)
│   ├── config/              # Proyecto Django: settings, urls, api, base_models
│   ├── usuarios/            # App de usuarios (modelo Usuario, roles, JWT)
│   ├── operaciones/         # App de negocio (reservas, flota, servicios, etc.)
│   ├── manage.py
│   ├── requirements.txt
│   └── seed_data.py         # Carga de datos iniciales (usuarios, servicios, flota)
│
├── frontend/                # Sitio web público (React + Vite)
│   └── src/
│       ├── pages/           # Home, Servicios, Flota, Reservas, Seguimiento, Contacto…
│       ├── components/      # Layout
│       └── services/        # api.js (cliente Axios)
│
├── admin-panel/             # Panel administrativo (React + Vite)
│   └── src/
│       ├── pages/           # Dashboard, Reservas, Flota, Conductores, Usuarios…
│       ├── components/      # DataTable, ModalForm, Sidebar…
│       └── services/        # api.js (con interceptor JWT)
│
├── database/                # schema.sql y seed.sql (referencia)
└── docker-compose.yml       # Servicio de PostgreSQL para desarrollo (opcional)
```

---

## Módulos del backend

### `config`
Proyecto Django. Contiene:
- `settings.py`: configuración (base de datos, CORS, JWT, correo, estáticos).
- `urls.py` y `api.py`: montaje de la API en `/api/` y registro de los routers.
- `base_models.py`: modelo base abstracto con **UUID** como llave primaria, campos de auditoría (`created_at`, `updated_at`) y **borrado lógico** (soft delete) mediante `deleted_at`.

### `usuarios`
Modelo de usuario personalizado (`Usuario`) que extiende `AbstractUser`:
- Login por **email** (`USERNAME_FIELD = 'email'`).
- Roles: `ADMIN` y `CLIENTE`.
- Campos de negocio: `nombre_completo`, `telefono`, `rol`.
- Soft delete y UUID como PK.
- Autenticación **JWT** (Django Ninja JWT) para el panel administrativo.

### `operaciones`
Núcleo del negocio. Modelos principales:

| Modelo | Descripción |
|--------|-------------|
| `Servicio` | Servicios ofrecidos (nombre, descripción, tarifa referencial, activo). |
| `Vehiculo` | Unidades de la flota (placa, marca, modelo, capacidad, estado, kilometraje). |
| `Conductor` | Conductores (nombre, licencia, teléfono, estado). |
| `Mantenimiento` | Historial de mantenimiento por vehículo (fecha, kilometraje, costo). |
| `Reserva` | Reserva de un servicio (código único, cliente, fechas, pasajeros, estado, tarifa). |
| `MensajeContacto` | Consultas enviadas desde el formulario de contacto. |

Estados de una `Reserva`: `PENDIENTE → CONFIRMADA → EN_CURSO → COMPLETADA`, con ramas `RECHAZADA` y `CANCELADA`.

`services.py` contiene la lógica de dominio auxiliar:
- `calcular_costo_combustible(...)`: estima el costo de combustible de una ruta.
- `verificar_mantenimiento(...)`: indica si un vehículo requiere mantenimiento preventivo (≥ 10 000 km desde el último).

---

## API REST

Base: `/api/`. Documentación interactiva (Swagger) en `/api/docs`.

**Autenticación (JWT)**

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/token/pair` | Obtener token de acceso y refresco. |
| POST | `/api/token/refresh` | Refrescar el token de acceso. |
| GET | `/api/salud/` | Comprobación de estado de la API. |

**Público (`/api/operaciones/`)**

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/operaciones/servicios` | Lista los servicios activos. |
| POST | `/operaciones/reservas` | Crea una reserva y envía el correo de confirmación. |
| GET | `/operaciones/reservas/seguimiento/{codigo}` | Consulta el estado de una reserva por su código. |
| POST | `/operaciones/contacto/` | Registra un mensaje de contacto. |

**Administración (`/api/admin/`, requiere JWT)**

| Recurso | Rutas |
|---------|-------|
| Dashboard | `GET /admin/dashboard/stats/`, `GET /admin/dashboard/chart/` |
| Reportes | `GET /admin/reportes/reservas-csv/` |
| Reservas | CRUD en `/admin/reservas/…`, `PUT /admin/reservas/{id}/estado`, `GET /admin/calendario/` |
| Rutas | `POST /admin/rutas/asignar/`, `POST /admin/rutas/calcular-combustible/` |
| Flota | CRUD en `/admin/vehiculos/…`, `POST /admin/mantenimientos/` |
| Conductores | CRUD en `/admin/conductores/…` |
| Servicios | CRUD en `/admin/servicios/…` |
| Mensajes | `GET /admin/mensajes/…`, `PUT /admin/mensajes/{id}/leido` |
| Usuarios | CRUD en `/admin/usuarios/…` |
| Lookups | `GET /admin/lookups/{servicios,vehiculos,conductores,clientes}` |

---

## Frontend público

Aplicación React (`frontend/`) con las siguientes páginas:

- **Inicio** — presentación de la empresa.
- **Nosotros** — información institucional.
- **Servicios** — catálogo de servicios (RF-01).
- **Flota** — vehículos disponibles.
- **Clientes** — referencias.
- **Reservas** — formulario de registro con consentimiento de datos; muestra el código de seguimiento al finalizar (RF-02, RF-04).
- **Seguimiento** — consulta del estado de una reserva por código (RF-08).
- **Contacto** — formulario de consultas (RF-13).

El cliente Axios está en `src/services/api.js` y toma la URL del backend de `VITE_API_URL` (con respaldo a la URL de producción).

---

## Panel administrativo

Aplicación React (`admin-panel/`) protegida por login (JWT):

- **Login** — autenticación por email y contraseña.
- **Dashboard** — indicadores del mes (reservas, ingresos estimados, vehículos activos, mantenimientos pendientes) y gráfico de tendencia (RF-12).
- **Reservas** — gestión y asignación de vehículo/conductor; generación de orden de servicio en PDF.
- **Flota y Mantenimiento** — gestión de vehículos y registro de mantenimientos.
- **Conductores** — gestión de conductores.
- **Usuarios** — gestión de usuarios.
- **Mensajes** — bandeja de consultas de contacto.
- **Configuración** — cambio de contraseña del administrador.

---

## Reglas de negocio

Reglas implementadas en el backend:

- **Aforo (RDm-01):** al asignar un vehículo, los pasajeros no pueden superar su número de asientos (`capacidad`).
- **Cruce de horarios (RDm-02):** un vehículo o conductor no puede asignarse a dos reservas que se solapan en el tiempo.
- **Código único (RF-04):** cada reserva recibe un código correlativo `MG-AAAA-NNNN`.
- **Confirmación (RF-05):** al registrar la reserva se envía un correo automático con el código.
- **Consentimiento (RDm-04):** el formulario exige aceptar la Ley N.° 29733 antes de guardar los datos.
- **Confirmación con recursos:** una reserva no puede pasar a `CONFIRMADA` sin vehículo y conductor asignados.

---

## Requisitos previos

- [Python](https://www.python.org/) 3.11 o superior
- [Node.js](https://nodejs.org/) 18 o superior
- [PostgreSQL](https://www.postgresql.org/) 16/17 (o Docker para levantarlo con `docker-compose`)

---

## Instalación y ejecución local

### 1. Base de datos

Con PostgreSQL instalado, crea la base de datos:

```sql
CREATE DATABASE grijalva_reservas;
```

> Alternativa con Docker: `docker compose up -d` levanta PostgreSQL en el puerto `5433`.

### 2. Backend (Django)

```bash
cd backend
python -m venv venv
venv\Scripts\activate            # Windows  (Linux/Mac: source venv/bin/activate)
pip install -r requirements.txt

# Crear el archivo .env (ver sección "Variables de entorno")
python manage.py migrate
python seed_data.py              # datos iniciales: admin, servicios, flota, conductores
python manage.py runserver
```

La API queda en `http://127.0.0.1:8000/api/` y la documentación en `http://127.0.0.1:8000/api/docs`.

### 3. Frontends (React)

En dos terminales aparte, para cada frontend (`frontend/` y `admin-panel/`):

```bash
cd frontend                      # y luego repetir en  cd admin-panel
npm install
# Crear .env.local con la URL del backend local (ver "Variables de entorno")
npm run dev
```

- Sitio público: `http://localhost:5173`
- Panel administrativo: `http://localhost:5174`

---

## Variables de entorno

### `backend/.env`

```env
DEBUG=True
SECRET_KEY=tu-clave-secreta
ALLOWED_HOSTS=*
CORS_ALLOW_ALL_ORIGINS=True

# Base de datos PostgreSQL
DB_NAME=grijalva_reservas
DB_USER=postgres
DB_PASSWORD=tu_password
DB_HOST=127.0.0.1
DB_PORT=5432

# Correo (opcional). Sin estas variables se usa el backend de consola.
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=tu_correo@gmail.com
EMAIL_HOST_PASSWORD=tu_contraseña_de_aplicacion
DEFAULT_FROM_EMAIL=Multiservicios Grijalva <tu_correo@gmail.com>
```

### `frontend/.env.local` y `admin-panel/.env.local`

```env
# frontend/
VITE_API_URL=http://127.0.0.1:8000/api/operaciones/

# admin-panel/
VITE_API_URL=http://127.0.0.1:8000/api
```

> Los archivos `.env` y `.env.local` están en `.gitignore` y **no** se suben al repositorio.

---

## Pruebas automatizadas

Suite con **pytest** sobre los flujos críticos de la API (`backend/operaciones/test_api.py`):

```bash
cd backend
venv\Scripts\python -m pytest        # -v para ver cada prueba
```

Cubre: listado de servicios activos, generación del código de reserva, envío del correo de confirmación, consulta por código de seguimiento y la regla de no solapamiento de horarios.

---

## Despliegue

- **Frontends** → Vercel (build de Vite; SPA con reescritura a `index.html`).
- **Backend + base de datos** → Render (`build.sh` ejecuta `collectstatic` y `migrate`; servido con Gunicorn + WhiteNoise).

En producción, las URLs de la API se toman de `VITE_API_URL` (con respaldo a la URL de Render) y las credenciales de correo se configuran como variables de entorno del servicio.

---

## Credenciales de demostración

Panel administrativo (creadas por `seed_data.py`):

- **Usuario:** `admin@grijalva.pe`
- **Contraseña:** `Admin2026!`
