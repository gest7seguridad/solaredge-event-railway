#!/bin/bash

# ============================================
# SCRIPT DE MIGRACIÓN DE BASE DE DATOS - PLESK
# ============================================

echo "======================================"
echo "🗄️  MIGRACIÓN DE BASE DE DATOS"
echo "======================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Variables de entorno
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
elif [ -f ".env.plesk" ]; then
    export $(cat .env.plesk | grep -v '^#' | xargs)
else
    echo -e "${RED}❌ No se encontró archivo .env${NC}"
    echo "Por favor, crea un archivo .env con las credenciales de la base de datos"
    exit 1
fi

# Función para verificar comandos
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 no está instalado${NC}"
        return 1
    else
        echo -e "${GREEN}✅ $1 disponible${NC}"
        return 0
    fi
}

# Función para test de conexión
test_connection() {
    echo -n "  Probando conexión a $DB_HOST:$DB_PORT... "

    if command -v psql &> /dev/null; then
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1" &>/dev/null
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Conexión exitosa${NC}"
            return 0
        else
            echo -e "${RED}❌ Error de conexión${NC}"
            return 1
        fi
    else
        # Alternativa con Node.js
        node -e "
        const pg = require('pg');
        const client = new pg.Client({
            host: '$DB_HOST',
            port: $DB_PORT,
            database: '$DB_NAME',
            user: '$DB_USER',
            password: '$DB_PASSWORD'
        });
        client.connect()
            .then(() => {
                console.log('✅ Conexión exitosa');
                client.end();
                process.exit(0);
            })
            .catch(err => {
                console.error('❌ Error:', err.message);
                process.exit(1);
            });
        " 2>/dev/null
        return $?
    fi
}

# ============================================
# PASO 1: VERIFICACIÓN INICIAL
# ============================================
echo -e "${BLUE}1. VERIFICACIÓN INICIAL${NC}"
echo "================================"

echo "  Configuración detectada:"
echo "    Host: $DB_HOST"
echo "    Puerto: $DB_PORT"
echo "    Base de datos: $DB_NAME"
echo "    Usuario: $DB_USER"
echo ""

echo "  Verificando herramientas:"
check_command "node"
check_command "npm"
check_command "psql" || echo -e "${YELLOW}  ⚠️ psql no disponible, usando Node.js${NC}"

echo ""

# ============================================
# PASO 2: TEST DE CONEXIÓN
# ============================================
echo -e "${BLUE}2. TEST DE CONEXIÓN${NC}"
echo "================================"

if ! test_connection; then
    echo -e "${RED}No se puede conectar a la base de datos${NC}"
    echo "Verifica las credenciales en el archivo .env"
    exit 1
fi

echo ""

# ============================================
# PASO 3: BACKUP (OPCIONAL)
# ============================================
echo -e "${BLUE}3. BACKUP DE BASE DE DATOS${NC}"
echo "================================"

read -p "¿Deseas crear un backup antes de migrar? (s/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Ss]$ ]]; then
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"

    echo -n "  Creando backup en $BACKUP_FILE... "

    if command -v pg_dump &> /dev/null; then
        PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > $BACKUP_FILE 2>/dev/null
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Backup creado${NC}"
            echo "  Tamaño: $(du -sh $BACKUP_FILE | cut -f1)"
        else
            echo -e "${RED}❌ Error creando backup${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ pg_dump no disponible${NC}"
        echo "  Puedes crear un backup manual desde tu cliente PostgreSQL"
    fi
fi

echo ""

# ============================================
# PASO 4: EJECUTAR MIGRACIONES
# ============================================
echo -e "${BLUE}4. EJECUTANDO MIGRACIONES${NC}"
echo "================================"

cd backend 2>/dev/null || cd /var/www/vhosts/solarland.gestsiete.es/httpdocs/backend 2>/dev/null

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ No se encontró el directorio backend${NC}"
    exit 1
fi

echo "  Ejecutando migraciones con Knex..."
echo ""

# Ejecutar migraciones
npm run db:migrate

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Migraciones ejecutadas correctamente${NC}"
else
    echo ""
    echo -e "${RED}❌ Error ejecutando migraciones${NC}"
    echo "  Verifica los logs para más detalles"
    exit 1
fi

echo ""

# ============================================
# PASO 5: SEEDS (OPCIONAL)
# ============================================
echo -e "${BLUE}5. DATOS INICIALES (SEEDS)${NC}"
echo "================================"

read -p "¿Deseas cargar datos iniciales (seeds)? (s/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo "  Ejecutando seeds..."
    npm run db:seed

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Seeds ejecutados correctamente${NC}"
    else
        echo -e "${YELLOW}⚠️ Error ejecutando seeds${NC}"
    fi
fi

echo ""

# ============================================
# PASO 6: VERIFICACIÓN FINAL
# ============================================
echo -e "${BLUE}6. VERIFICACIÓN FINAL${NC}"
echo "================================"

echo "  Verificando tablas creadas..."

# Script Node.js para verificar tablas
node -e "
const pg = require('pg');
const client = new pg.Client({
    host: '$DB_HOST',
    port: $DB_PORT,
    database: '$DB_NAME',
    user: '$DB_USER',
    password: '$DB_PASSWORD'
});

client.connect().then(async () => {
    try {
        // Verificar tablas principales
        const tables = await client.query(\"
            SELECT tablename
            FROM pg_tables
            WHERE schemaname = 'public'
            ORDER BY tablename
        \");

        console.log('  Tablas encontradas:');
        tables.rows.forEach(row => {
            console.log('    ✓', row.tablename);
        });

        // Contar registros
        const counts = await Promise.all([
            client.query('SELECT COUNT(*) FROM users').catch(() => ({rows: [{count: 0}]})),
            client.query('SELECT COUNT(*) FROM events').catch(() => ({rows: [{count: 0}]})),
            client.query('SELECT COUNT(*) FROM registrations').catch(() => ({rows: [{count: 0}]}))
        ]);

        console.log('');
        console.log('  Registros:');
        console.log('    Users:', counts[0].rows[0].count);
        console.log('    Events:', counts[1].rows[0].count);
        console.log('    Registrations:', counts[2].rows[0].count);

        client.end();
    } catch (err) {
        console.error('Error:', err.message);
        client.end();
        process.exit(1);
    }
}).catch(err => {
    console.error('Error conectando:', err.message);
    process.exit(1);
});
" 2>/dev/null

echo ""

# ============================================
# ROLLBACK (EN CASO DE ERROR)
# ============================================
echo -e "${BLUE}7. OPCIONES DE ROLLBACK${NC}"
echo "================================"

echo "  Si necesitas revertir las migraciones:"
echo "    npm run db:rollback"
echo ""
echo "  Si creaste un backup, puedes restaurarlo con:"
echo "    PGPASSWORD=\$DB_PASSWORD psql -h \$DB_HOST -p \$DB_PORT -U \$DB_USER -d \$DB_NAME < $BACKUP_FILE"
echo ""

# ============================================
# RESUMEN
# ============================================
echo "======================================"
echo -e "${GREEN}✅ MIGRACIÓN COMPLETADA${NC}"
echo "======================================"
echo ""
echo "Base de datos configurada en:"
echo "  Host: $DB_HOST"
echo "  Database: $DB_NAME"
echo ""
echo "Próximos pasos:"
echo "  1. Verificar la aplicación en https://solarland.gestsiete.es"
echo "  2. Probar el registro de eventos"
echo "  3. Verificar el panel de administración"
echo ""

# Volver al directorio original
cd - > /dev/null 2>&1

exit 0