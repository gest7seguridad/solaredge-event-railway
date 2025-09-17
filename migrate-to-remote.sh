#!/bin/bash

echo "======================================"
echo "🚀 MIGRACIÓN A BD REMOTA GESTSIETE.ES"
echo "======================================"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración de BD remota
REMOTE_HOST="gestsiete.es"
REMOTE_PORT="5432"
REMOTE_DB="events_n"
REMOTE_USER="events_u"
REMOTE_PASS="events_pass\$\$"

echo -e "${YELLOW}📋 Configuración de BD remota:${NC}"
echo "   Host: $REMOTE_HOST"
echo "   Base de datos: $REMOTE_DB"
echo "   Usuario: $REMOTE_USER"
echo ""

# Verificar conexión a BD remota
echo -e "${YELLOW}🔌 Verificando conexión a BD remota...${NC}"
PGPASSWORD=$REMOTE_PASS psql -h $REMOTE_HOST -p $REMOTE_PORT -U $REMOTE_USER -d $REMOTE_DB -c '\l' > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Conexión exitosa a BD remota${NC}"
else
    echo -e "${RED}❌ Error: No se puede conectar a la BD remota${NC}"
    echo "   Verifica las credenciales y que el servidor permita conexiones remotas"
    exit 1
fi

# Preguntar si queremos migrar datos locales
echo ""
echo -e "${YELLOW}¿Deseas migrar los datos de la BD local a la remota?${NC}"
echo "1) Sí - Migrar estructura y datos"
echo "2) No - Solo crear estructura vacía"
read -p "Selecciona una opción (1/2): " option

case $option in
    1)
        echo -e "${YELLOW}📦 Exportando datos locales...${NC}"
        if [ -f "database_backup.sql" ]; then
            echo "Usando backup existente: database_backup.sql"
        else
            pg_dump -U postgres -h localhost -d solaredge_event --no-owner --no-privileges --if-exists --clean > database_backup.sql
            echo -e "${GREEN}✅ Backup local creado${NC}"
        fi
        
        echo -e "${YELLOW}📤 Importando datos a BD remota...${NC}"
        PGPASSWORD=$REMOTE_PASS psql -h $REMOTE_HOST -p $REMOTE_PORT -U $REMOTE_USER -d $REMOTE_DB < database_backup.sql
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Datos migrados correctamente${NC}"
        else
            echo -e "${RED}❌ Error al migrar datos${NC}"
            exit 1
        fi
        ;;
    2)
        echo -e "${YELLOW}📝 Creando solo estructura en BD remota...${NC}"
        
        # Crear archivo SQL con estructura básica
        cat > structure_only.sql << 'EOF'
-- Limpiar tablas existentes
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

-- Tabla de eventos
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date TIMESTAMP NOT NULL,
    location VARCHAR(500),
    address VARCHAR(500),
    capacity INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    agenda JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de inscripciones
CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    position VARCHAR(100),
    confirmation_code VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'confirmed',
    checked_in BOOLEAN DEFAULT false,
    checked_in_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de administradores
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar admin por defecto
INSERT INTO admin_users (email, password, name, role) 
VALUES ('admin@solarland.com', '$2a$10$YpDm4kHhAjV.JTYqE5hU9OGxKqV0Kl3sXcLyKs9wvHqkG3g7xFjGO', 'Administrador', 'admin');

-- Insertar evento de ejemplo
INSERT INTO events (
    title, 
    description, 
    event_date, 
    location, 
    address, 
    capacity, 
    is_active,
    agenda
) VALUES (
    'Curso Presencial SolarEdge - Optimización Real',
    'Formación especializada en optimizadores de potencia y tecnología SolarEdge',
    '2025-10-02 15:00:00',
    'Solarland S.L.',
    'C/ La Vista, 6. Villaverde, La Oliva - Fuerteventura',
    50,
    true,
    '[{"time":"15:00 - 15:30","title":"Registro y Bienvenida"},{"time":"15:30 - 16:30","title":"Introducción a SolarEdge"},{"time":"16:30 - 17:30","title":"Optimizadores de Potencia"},{"time":"17:30 - 18:00","title":"Descanso - Coffee Break"},{"time":"18:00 - 19:00","title":"Inversores y Monitorización"},{"time":"19:00 - 20:00","title":"Casos Prácticos"},{"time":"20:00 - 20:30","title":"Q&A y Cierre"}]'
);

-- Crear índices
CREATE INDEX idx_registrations_event_id ON registrations(event_id);
CREATE INDEX idx_registrations_email ON registrations(email);
CREATE INDEX idx_registrations_confirmation_code ON registrations(confirmation_code);
CREATE INDEX idx_events_is_active ON events(is_active);

EOF
        
        PGPASSWORD=$REMOTE_PASS psql -h $REMOTE_HOST -p $REMOTE_PORT -U $REMOTE_USER -d $REMOTE_DB < structure_only.sql
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Estructura creada correctamente${NC}"
            rm structure_only.sql
        else
            echo -e "${RED}❌ Error al crear estructura${NC}"
            exit 1
        fi
        ;;
    *)
        echo -e "${RED}Opción no válida${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}======================================"
echo "✅ MIGRACIÓN COMPLETADA"
echo "======================================"
echo ""
echo "📋 Próximos pasos:"
echo "1. Copia el archivo .env.production.remote a .env"
echo "   cp .env.production.remote .env"
echo ""
echo "2. Actualiza las credenciales SMTP en .env"
echo ""
echo "3. Inicia el sistema con Docker:"
echo "   docker-compose -f docker-compose.production.yml up -d"
echo ""
echo "4. Accede al sistema:"
echo "   - Frontend: http://tu-dominio"
echo "   - Admin: admin@solarland.com / admin123"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE: Cambia la contraseña del admin después del primer acceso${NC}"