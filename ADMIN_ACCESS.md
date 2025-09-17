# 🔐 CREDENCIALES DE ADMINISTRADOR

## 📧 Acceso al Panel de Administración

### URL de Acceso
```
https://solarland.gestsiete.es/admin
```

### Credenciales por Defecto

**Email:**
```
admin@solarland.com
```

**Contraseña:**
```
admin123456
```

---

## ⚠️ IMPORTANTE - CAMBIAR CONTRASEÑA

### Opción 1: Desde Variables de Entorno (Recomendado)

En Plesk → Node.js → Environment Variables, agregar:
```
ADMIN_EMAIL = tu-email@empresa.com
ADMIN_PASSWORD = NuevaContraseñaSegura2024!
```

Luego ejecutar las migraciones/seeds de nuevo.

### Opción 2: Cambiar en Base de Datos

Si tienes acceso a la base de datos PostgreSQL:

1. Generar hash de nueva contraseña:
```javascript
// Crear archivo: generate-hash.js
const bcrypt = require('bcryptjs');
const newPassword = 'TuNuevaContraseñaSegura2024!';
bcrypt.hash(newPassword, 10).then(hash => {
    console.log('Hash:', hash);
});
```

2. Actualizar en base de datos:
```sql
UPDATE admin_users
SET password = '[HASH_GENERADO]'
WHERE email = 'admin@solarland.com';
```

---

## 🔄 Si No Puedes Acceder

### Resetear Usuario Admin

1. Crear archivo `reset-admin.js` en `/backend/`:

```javascript
const bcrypt = require('bcryptjs');
const knex = require('knex');
const dbConfig = require('./dist/config/db-config');

async function resetAdmin() {
    const db = knex(dbConfig.getKnexConfig());

    const email = 'admin@solarland.com';
    const password = 'admin123456';
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await db('admin_users').where({ email }).update({
            password: hashedPassword,
            is_active: true
        });

        console.log('✅ Contraseña reseteada');
        console.log('Email:', email);
        console.log('Contraseña:', password);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await db.destroy();
    }
}

resetAdmin();
```

2. Ejecutar:
```bash
cd backend
node reset-admin.js
```

---

## 🛡️ Recomendaciones de Seguridad

1. **Cambiar credenciales inmediatamente** después del primer acceso
2. **Usar contraseña fuerte**: mínimo 12 caracteres, mayúsculas, números y símbolos
3. **No compartir credenciales** por canales inseguros
4. **Cambiar periódicamente** la contraseña (cada 3 meses)
5. **Considerar implementar 2FA** en futuras versiones

---

## 📱 Funcionalidades del Panel Admin

Una vez dentro del panel, podrás:

- 📊 Ver estadísticas de registros
- 📋 Gestionar eventos
- 👥 Ver lista de participantes
- 📥 Exportar datos a CSV
- 🎯 Controlar capacidad de eventos
- 📧 Reenviar confirmaciones
- 🗑️ Eliminar registros

---

## 🆘 Soporte

Si tienes problemas para acceder:

1. Verificar que estás en `/admin` (no `/admin/`)
2. Limpiar caché del navegador
3. Revisar logs en Plesk → Node.js → Show Logs
4. Verificar que la base de datos tiene la tabla `admin_users`

---

**Fecha de creación**: Septiembre 2025
**Último cambio de contraseña**: Pendiente