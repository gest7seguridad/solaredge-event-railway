# 🔧 Guía de Solución de Problemas para Plesk - Event System

## ⚠️ IMPORTANTE: Error 502 Bad Gateway Persistente

Si después de actualizar sigues viendo el error 502, el problema es que Node.js NO está ejecutándose correctamente en Plesk.

## 🚨 SOLUCIÓN RÁPIDA - Pasos Ordenados

### PASO 1: Probar con servidor mínimo

1. En Plesk, cambiar **Application Startup File** a: `server-minimal.js`
2. Click en **Restart App**
3. Esperar 30 segundos
4. Visitar: `https://solarland.gestsiete.es/api/health`
5. Si funciona, el problema está en las dependencias. Si NO funciona, el problema es de configuración de Plesk.

### PASO 2: Verificar que Node.js está instalado correctamente

SSH al servidor y ejecutar:
```bash
node --version
npm --version
which node
```

### PASO 3: Verificar el estado real de la aplicación

En el panel de Plesk:
1. Ir a **Node.js**
2. Verificar el estado de la aplicación
3. Click en **Logs** para ver errores específicos
4. Si ves "Module not found", ejecutar `npm install --production`

### 2. Verificar el Puerto de la Aplicación

El error 502 generalmente ocurre cuando Plesk no puede conectarse al puerto de Node.js.

**En el panel de Plesk Node.js:**
- **Application Startup File**: `app.js`
- **Application Mode**: `production`
- **Port**: Dejar que Plesk lo asigne automáticamente o usar `3000`

### 3. Verificar Variables de Entorno en Plesk

En la sección **Application Parameters**, añadir estas variables:

```
NODE_ENV = production
PORT = 3000
DB_HOST = server.radioinsular.es
DB_NAME = eventos_n
DB_USER = eventos_u
DB_PASSWORD = [tu contraseña]
JWT_SECRET = [tu clave secreta]
CORS_ORIGINS = https://solarland.gestsiete.es
```

### 4. Modificar app.js para Compatibilidad con Plesk

Si sigue sin funcionar, actualiza el inicio del servidor en `app.js`:

```javascript
// Al final del archivo app.js, cambiar:
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 5. Verificar Logs

En Plesk, revisar los logs de la aplicación:
1. Ir a **Node.js** → **Logs**
2. Buscar errores específicos
3. Los errores comunes incluyen:
   - Cannot connect to database
   - Module not found
   - Port already in use

### 6. Probar con el Servidor de Test

Para verificar que Plesk puede ejecutar Node.js:

1. Subir `test-server.js` a Plesk
2. En **Application Startup File**, cambiar temporalmente a `test-server.js`
3. Reiniciar la aplicación
4. Visitar: `https://solarland.gestsiete.es/api/health`
5. Si funciona, el problema está en app.js o en las dependencias

### 7. Verificar Dependencias

Asegurarse de que todas las dependencias están instaladas:

```bash
# En el terminal de Plesk o SSH:
cd /path/to/your/app
npm install --production
```

### 8. Verificar CORS

El error podría estar relacionado con CORS. En `app.js`, verificar:

```javascript
app.use(cors({
  origin: ['https://solarland.gestsiete.es', 'http://localhost:3000'],
  credentials: true
}));
```

### 9. Modo de Depuración

Para obtener más información sobre el error:

1. Crear archivo `.env` en el servidor con:
```
NODE_ENV=development
DEBUG=*
```

2. Reiniciar la aplicación y revisar los logs

### 10. Configuración de Proxy en Plesk

Si Plesk usa Apache/Nginx como proxy:

1. Ir a **Apache & nginx Settings**
2. En **Additional nginx directives**, añadir:

```nginx
location /api {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Script de Verificación

Ejecutar este comando en el terminal de Plesk para verificar el estado:

```bash
#!/bin/bash
echo "=== Verificación de Event System ==="
echo "1. Node.js version:"
node --version
echo ""
echo "2. NPM version:"
npm --version
echo ""
echo "3. Verificando puerto 3000:"
netstat -tuln | grep 3000
echo ""
echo "4. Probando conexión local:"
curl -I http://localhost:3000/api/health
echo ""
echo "5. Variables de entorno:"
env | grep -E "NODE_ENV|PORT|DB_"
```

## Solución Rápida

Si necesitas una solución rápida mientras debugeas:

1. **Usar el test-server.js** temporalmente para verificar que Plesk funciona
2. **Verificar la base de datos** - El error 502 puede ocurrir si no se conecta a PostgreSQL
3. **Revisar el archivo .env** - Asegurarse de que existe y tiene los valores correctos
4. **Reiniciar todo el servidor** si es posible (no solo la app)

## Contacto con Soporte de Plesk

Si el problema persiste, al contactar soporte indicar:
- Versión de Plesk
- Versión de Node.js
- Logs de error específicos
- Si el test-server.js funciona o no