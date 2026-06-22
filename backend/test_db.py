"""
test_db.py -- Script de verificacion y creacion automatica de la base de datos.
Uso: .\\venv\\Scripts\\python test_db.py
"""
import os
import sys
import environ
from pathlib import Path

# Forzar salida UTF-8 en Windows para evitar errores de codificacion
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Cargar variables de entorno
BASE_DIR = Path(__file__).resolve().parent
env = environ.Env()
environ.Env.read_env(BASE_DIR / '.env')

DB_NAME     = env('DB_NAME',     default='grijalva_reservas')
DB_USER     = env('DB_USER',     default='postgres')
DB_PASSWORD = env('DB_PASSWORD', default='postgres')
DB_HOST     = env('DB_HOST',     default='127.0.0.1')
DB_PORT     = env('DB_PORT',     default='5432')

try:
    import psycopg2
except ImportError:
    print("[ERROR] psycopg2 no encontrado. Ejecuta: pip install -r requirements.txt")
    sys.exit(1)


def probar_conexion(dbname):
    try:
        conn = psycopg2.connect(
            dbname=dbname,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT,
            connect_timeout=5,
        )
        return conn
    except psycopg2.OperationalError:
        return None


def crear_base_de_datos():
    print("   -> Conectandose a la BD 'postgres' para crear '{}'...".format(DB_NAME))
    conn = probar_conexion('postgres')
    if conn is None:
        print("[ERROR] No se pudo conectar a PostgreSQL.")
        print("        Verifica que el servicio 'postgresql-x64-18' este activo.")
        print("        Inicio desde Servicios de Windows: services.msc")
        sys.exit(1)
    conn.autocommit = True
    with conn.cursor() as cur:
        cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (DB_NAME,))
        existe = cur.fetchone()
        if not existe:
            cur.execute('CREATE DATABASE "{}"'.format(DB_NAME))
            print("   [OK] Base de datos '{}' creada exitosamente.".format(DB_NAME))
        else:
            print("   [INFO] La base de datos '{}' ya existe.".format(DB_NAME))
    conn.close()


print("=" * 60)
print("  VERIFICACION DE CONEXION -- Multiservicios Grijalva")
print("=" * 60)
print("  Host:          {}:{}".format(DB_HOST, DB_PORT))
print("  Usuario:       {}".format(DB_USER))
print("  Base de datos: {}".format(DB_NAME))
print("-" * 60)

# Paso 1: Intentar conexion directa
print("\n[1/3] Intentando conexion a '{}'...".format(DB_NAME))
conn = probar_conexion(DB_NAME)

if conn:
    print("   [OK] Conexion exitosa a '{}'.".format(DB_NAME))
    conn.close()
else:
    print("   [WARN] No se pudo conectar. Intentando crear la BD...")
    crear_base_de_datos()
    conn = probar_conexion(DB_NAME)
    if conn:
        print("   [OK] Conexion verificada a '{}' tras la creacion.".format(DB_NAME))
        conn.close()
    else:
        print("[ERROR] Fallo persistente. Verifica credenciales en .env")
        sys.exit(1)

# Paso 2: Version del servidor
print("\n[2/3] Verificando version del servidor PostgreSQL...")
conn = probar_conexion(DB_NAME)
with conn.cursor() as cur:
    cur.execute("SELECT version()")
    version = cur.fetchone()[0]
    print("   [OK] {}".format(version.split(',')[0]))
conn.close()

# Paso 3: Resultado final
print("\n[3/3] Diagnostico completado.")
print("-" * 60)
print("  [LISTO] Ejecuta ahora en orden:")
print()
print("    .\\venv\\Scripts\\python manage.py migrate")
print("    .\\venv\\Scripts\\python manage.py createsuperuser")
print("    .\\venv\\Scripts\\python seed_data.py")
print("    .\\venv\\Scripts\\python manage.py runserver")
print("=" * 60)
