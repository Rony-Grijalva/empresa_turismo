import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection

with connection.cursor() as cursor:
    try: cursor.execute('ALTER TABLE reservas ADD COLUMN cliente_nombre VARCHAR(200) DEFAULT \'Cliente Web\';')
    except Exception as e: print(e)
    
    try: cursor.execute('ALTER TABLE reservas ADD COLUMN cliente_correo VARCHAR(254) DEFAULT \'sin@correo.com\';')
    except Exception as e: print(e)
    
    try: cursor.execute('ALTER TABLE reservas ADD COLUMN cliente_telefono VARCHAR(20) DEFAULT NULL;')
    except Exception as e: print(e)
    
    try: cursor.execute('ALTER TABLE vehiculos ADD COLUMN marca VARCHAR(100) DEFAULT \'Desconocida\';')
    except Exception as e: print(e)
    
    try: cursor.execute('ALTER TABLE vehiculos ADD COLUMN modelo VARCHAR(100) DEFAULT \'Desconocido\';')
    except Exception as e: print(e)
    
    try: cursor.execute('ALTER TABLE vehiculos ADD COLUMN anio INTEGER DEFAULT 2020;')
    except Exception as e: print(e)
    
    try: cursor.execute('ALTER TABLE vehiculos ADD COLUMN tipo_vehiculo VARCHAR(50) DEFAULT \'Furgoneta\';')
    except Exception as e: print(e)
    
    try: cursor.execute('ALTER TABLE vehiculos ADD COLUMN capacidad_carga DECIMAL(10,2) DEFAULT 1000.00;')
    except Exception as e: print(e)
    
    try: cursor.execute('ALTER TABLE vehiculos ADD COLUMN kilometraje_actual INTEGER DEFAULT 0;')
    except Exception as e: print(e)
    
    try: cursor.execute('ALTER TABLE vehiculos ADD COLUMN km_ultimo_mantenimiento INTEGER DEFAULT 0;')
    except Exception as e: print(e)
    
    try: cursor.execute('ALTER TABLE vehiculos ADD COLUMN detalles TEXT DEFAULT \'\';')
    except Exception as e: print(e)
    
    try: 
        cursor.execute('''CREATE TABLE mantenimientos (
            id UUID PRIMARY KEY,
            vehiculo_id UUID REFERENCES vehiculos(id) ON DELETE CASCADE,
            kilometraje_realizado INTEGER NOT NULL,
            fecha DATE NOT NULL,
            descripcion TEXT NOT NULL,
            costo DECIMAL(10,2) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );''')
    except Exception as e: print(e)

print('DB fixed')
