# 🔴 SOLUCIÓN: ERROR DE CONTRASEÑA DE BASE DE DATOS

## El Problema
La contraseña `events_pass$$` está siendo rechazada. Esto puede ser porque:
1. La contraseña real es diferente
2. Los `$$` causan problemas de escape
3. El archivo `.env` no tiene la contraseña correcta

## SOLUCIÓN RÁPIDA: SQL DIRECTO

### Opción 1: Usar phpMyAdmin/Adminer en Plesk

1. Acceder a **Databases** en Plesk
2. Click en **phpMyAdmin** o **Adminer**
3. Seleccionar la base de datos `events_n`
4. Ejecutar este SQL:

```sql
-- Crear tabla si no existe
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar usuario admin con contraseña hasheada
INSERT INTO admin_users (email, password, name, role, is_active)
VALUES (
    'admin@solarland.com',
    '$2b$10$YhPquF7lF0JlR5WLrBXkXeSPUwgLFqvzjPQRKlH2qD7sK7hJVhNvO',
    'Administrador',
    'admin',
    true
)
ON CONFLICT (email)
DO UPDATE SET
    password = '$2b$10$YhPquF7lF0JlR5WLrBXkXeSPUwgLFqvzjPQRKlH2qD7sK7hJVhNvO',
    is_active = true;
```

Este hash ya está listo para `admin123456`.

---

## SOLUCIÓN ALTERNATIVA: Verificar Contraseña Real

### Paso 1: Ver el archivo .env en el servidor

```bash
cat /var/www/vhosts/gestsiete.es/solarland.gestsiete.es/.env | grep DB_PASSWORD
```

### Paso 2: Actualizar el script

Si la contraseña es diferente, editar `create-admin.js`:

```javascript
// Cambiar esta línea con la contraseña correcta
password: 'LA_CONTRASEÑA_CORRECTA',
```

---

## SOLUCIÓN MANUAL: Crear Usuario con psql

Si tienes acceso a terminal:

```bash
# Conectar a PostgreSQL
psql -h gestsiete.es -U events_u -d events_n

# Cuando pida contraseña, intenta:
# - events_pass$$
# - events_pass
# - La que esté en .env

# Una vez conectado, ejecutar:
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO admin_users (email, password, name, role, is_active)
VALUES (
    'admin@solarland.com',
    '$2b$10$YhPquF7lF0JlR5WLrBXkXeSPUwgLFqvzjPQRKlH2qD7sK7hJVhNvO',
    'Administrador',
    'admin',
    true
);
```

---

## SI NO TIENES ACCESO A LA BD

### Opción 1: Verificar Variables en Plesk

1. Ir a **Node.js** en Plesk
2. Ver **Environment Variables**
3. Buscar `DB_PASSWORD`
4. Esa es la contraseña correcta

### Opción 2: Crear Script de Test

Crear archivo `test-db.js`:

```javascript
const pg = require('pg');

// Probar diferentes contraseñas
const passwords = [
    'events_pass$$',
    'events_pass',
    'tu_contraseña_aquí'
];

async function testPasswords() {
    for (const pwd of passwords) {
        const client = new pg.Client({
            host: 'gestsiete.es',
            port: 5432,
            database: 'events_n',
            user: 'events_u',
            password: pwd
        });

        try {
            await client.connect();
            console.log('✅ CONTRASEÑA CORRECTA:', pwd);
            await client.end();
            break;
        } catch (err) {
            console.log('❌ No funciona:', pwd.slice(0, 3) + '...');
        }
    }
}

testPasswords();
```

---

## VERIFICACIÓN FINAL

Una vez creado el usuario, acceder a:
- **URL**: https://solarland.gestsiete.es/admin
- **Email**: admin@solarland.com
- **Contraseña**: admin123456

---

## NOTA IMPORTANTE

Si la contraseña de la BD tiene caracteres especiales como `$$`, puede ser necesario:
1. Escaparla con backslash: `events_pass\$\$`
2. Ponerla entre comillas simples en .env
3. O usar la interfaz web de la BD directamente