# 📝 CREAR USUARIO ADMIN EN PLESK (SIN TERMINAL)

## Método 1: EJECUTAR DESDE PLESK

### Paso 1: Subir archivo
1. En **File Manager** de Plesk
2. Navegar a `/solarland.gestsiete.es/backend/`
3. Subir el archivo `create-admin.js`

### Paso 2: Ejecutar desde Scheduled Tasks
1. En Plesk, ir a **Tools & Settings** → **Scheduled Tasks** (Cron Jobs)
2. Click en **"Add Task"**
3. Configurar:
   - **Task type**: Run a command
   - **Command**:
   ```bash
   cd /var/www/vhosts/gestsiete.es/solarland.gestsiete.es/backend && node create-admin.js
   ```
   - **Run**: Select "Run once" o "Now"
4. Click **"OK"** o **"Run Now"**
5. Ver el output en logs

---

## Método 2: SCRIPT SQL DIRECTO

Si tienes acceso a phpMyAdmin o cliente PostgreSQL en Plesk:

### Paso 1: Generar hash de contraseña
Usa esta herramienta online: https://bcrypt-generator.com/
- Texto: `admin123456`
- Rounds: 10
- Copiar el hash generado (empieza con $2a$ o $2b$)

### Paso 2: Ejecutar SQL
```sql
-- Primero, verificar si la tabla existe
SELECT * FROM admin_users;

-- Si la tabla NO existe, crearla:
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

-- Insertar o actualizar el usuario admin
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
    password = EXCLUDED.password,
    is_active = true,
    updated_at = CURRENT_TIMESTAMP;
```

**Nota**: El hash mostrado es para `admin123456`. Si quieres usar otra contraseña, genera un nuevo hash.

---

## Método 3: USAR NODE.JS DESDE PLESK

### Paso 1: Crear tarea en Node.js
1. En Plesk → **Node.js**
2. En la sección **"Run Script"**
3. Pegar este código:

```javascript
// Código simplificado para copiar/pegar
const bcrypt = require('bcryptjs');
const pg = require('pg');

const client = new pg.Client({
    host: 'gestsiete.es',
    port: 5432,
    database: 'events_n',
    user: 'events_u',
    password: 'events_pass$$'
});

async function createAdmin() {
    await client.connect();

    const email = 'admin@solarland.com';
    const password = 'admin123456';
    const hash = await bcrypt.hash(password, 10);

    try {
        // Intentar actualizar primero
        const updateResult = await client.query(
            'UPDATE admin_users SET password = $1 WHERE email = $2',
            [hash, email]
        );

        if (updateResult.rowCount === 0) {
            // Si no existe, insertar
            await client.query(
                'INSERT INTO admin_users (email, password, name, role, is_active) VALUES ($1, $2, $3, $4, $5)',
                [email, hash, 'Administrador', 'admin', true]
            );
            console.log('Usuario creado');
        } else {
            console.log('Contraseña actualizada');
        }
    } catch (err) {
        console.error('Error:', err);
    }

    await client.end();
}

createAdmin();
```

---

## Método 4: ARCHIVO PHP (Si Node.js no funciona)

### Crear archivo `create-admin.php`:
```php
<?php
// Configuración de base de datos
$host = 'gestsiete.es';
$port = '5432';
$dbname = 'events_n';
$user = 'events_u';
$password = 'events_pass$$';

// Conectar a PostgreSQL
$conn_string = "host=$host port=$port dbname=$dbname user=$user password=$password";
$conn = pg_connect($conn_string);

if (!$conn) {
    die("Error de conexión\n");
}

// Hash de contraseña (admin123456)
$hash = '$2b$10$YhPquF7lF0JlR5WLrBXkXeSPUwgLFqvzjPQRKlH2qD7sK7hJVhNvO';

// SQL para insertar/actualizar
$sql = "INSERT INTO admin_users (email, password, name, role, is_active)
        VALUES ('admin@solarland.com', '$hash', 'Administrador', 'admin', true)
        ON CONFLICT (email) DO UPDATE SET password = '$hash'";

$result = pg_query($conn, $sql);

if ($result) {
    echo "✅ Usuario admin creado/actualizado exitosamente\n";
    echo "Email: admin@solarland.com\n";
    echo "Contraseña: admin123456\n";
} else {
    echo "❌ Error: " . pg_last_error($conn);
}

pg_close($conn);
?>
```

Subir y acceder desde navegador: `https://solarland.gestsiete.es/create-admin.php`

---

## 🔐 VERIFICACIÓN

Después de ejecutar cualquier método:

1. Ir a: `https://solarland.gestsiete.es/admin`
2. Iniciar sesión con:
   - Email: `admin@solarland.com`
   - Contraseña: `admin123456`

---

## ⚠️ IMPORTANTE

1. **Elimina** los scripts después de usarlos
2. **Cambia** la contraseña inmediatamente
3. Si sigue sin funcionar, verifica en logs de Node.js si hay algún error de autenticación

---

## 🆘 Si Nada Funciona

El problema puede ser que:
1. La tabla `admin_users` no existe
2. Hay un problema con la ruta de login
3. JWT_SECRET no está configurado

Verifica en logs de Node.js el error específico cuando intentas hacer login.