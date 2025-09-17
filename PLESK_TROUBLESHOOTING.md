# 🔧 DIAGNÓSTICO Y SOLUCIÓN PARA ERROR 502 EN PLESK

## 🔴 Problema Actual
- Error 502 Bad Gateway al intentar login
- El servidor Node.js no está respondiendo en el puerto esperado

## 📋 Lista de Verificación Rápida

### 1. ¿El servidor Node.js está corriendo?

En Plesk, ve a **Node.js** y verifica:
- Estado: Debe decir "Running" (no "Stopped")
- Si está detenido, click en **Start App**

### 2. Verificar Logs

En Plesk Node.js, click en **Show Logs** y busca:
- Errores de módulos no encontrados
- Errores de conexión a base de datos
- Puerto en uso

### 3. Prueba con servidor mínimo

**PASO 1**: Sube este archivo a Plesk:
- `test-server.js` (servidor de prueba sin base de datos)

**PASO 2**: En Plesk Node.js:
- Cambia **Application Startup File** a: `test-server.js`
- Click **Restart App**

**PASO 3**: Prueba:
```
https://solarland.gestsiete.es/api/health
```

Si funciona, el problema es la conexión a la BD.
Si no funciona, el problema es de configuración de Plesk.

## 🛠️ SOLUCIONES POR TIPO DE ERROR

### Error: "Cannot find module 'express'"

**Solución**:
1. En Plesk Node.js, click **NPM Install**
2. O por SSH:
```bash
cd /var/www/vhosts/gestsiete.es/solarland.gestsiete.es
npm install express cors bcryptjs jsonwebtoken pg
```

### Error: "ECONNREFUSED database"

**Solución**: La BD no es accesible. Verifica:
1. Variables de entorno en Plesk:
   - DB_HOST = server.radioinsular.es
   - DB_PORT = 5432
   - DB_NAME = eventos_n
   - DB_USER = eventos_u
   - DB_PASSWORD = eventos_pass

### Error: "Port 3000 is already in use"

**Solución**:
1. Cambia el puerto en variables de entorno:
   - PORT = 3001
2. Reinicia la app

### Error: "Permission denied"

**Solución por SSH**:
```bash
cd /var/www/vhosts/gestsiete.es/solarland.gestsiete.es
chmod 755 app.js
chmod 755 server.js
chown -R tuusuario:psacln .
```

## 🔍 DIAGNÓSTICO AVANZADO

### Test 1: Verificar que Node.js funciona

Crea un archivo `minimal.js`:
```javascript
const http = require('http');
const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({ status: 'OK', port: PORT }));
}).listen(PORT);

console.log('Server on port ' + PORT);
```

Usa este como Application Startup File y reinicia.

### Test 2: Verificar Express

Si el test mínimo funciona, prueba con Express:
```javascript
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log('Express on port ' + PORT);
});
```

## 📂 Estructura de Archivos Necesaria

```
/solarland.gestsiete.es/
├── app.js                 ← Archivo principal
├── package.json           ← Con dependencias
├── package-lock.json
├── node_modules/          ← Instalado con NPM Install
│   ├── express/
│   ├── cors/
│   ├── bcryptjs/
│   ├── jsonwebtoken/
│   └── pg/
└── frontend/
    └── dist/             ← Frontend compilado
        └── index.html
```

## 🔐 Configuración Correcta en Plesk

### Application Settings
- **Application Root**: `/solarland.gestsiete.es`
- **Application Startup File**: `app.js`
- **Node.js version**: 18 o superior

### Variables de Entorno
```
NODE_ENV = production
PORT = 3000
DB_HOST = server.radioinsular.es
DB_PORT = 5432
DB_NAME = eventos_n
DB_USER = eventos_u
DB_PASSWORD = eventos_pass
JWT_SECRET = SolarLand2025ProductionToken
```

## 🚨 SI NADA FUNCIONA

### Opción 1: Usar PM2 manualmente

Por SSH:
```bash
cd /var/www/vhosts/gestsiete.es/solarland.gestsiete.es
npm install pm2 -g
pm2 start app.js --name solarland
pm2 save
pm2 startup
```

### Opción 2: Verificar Proxy de Apache/Nginx

El archivo de configuración debe tener:
```apache
ProxyPass /api http://localhost:3000/api
ProxyPassReverse /api http://localhost:3000/api
```

### Opción 3: Contactar Soporte de Plesk

Proporciona esta información:
1. "La aplicación Node.js no responde en el puerto 3000"
2. "Error 502 Bad Gateway al acceder a /api/*"
3. "El archivo app.js está configurado como startup file"

## 📝 Comando de Emergencia (SSH)

Si tienes acceso SSH, ejecuta esto para un diagnóstico completo:
```bash
cd /var/www/vhosts/gestsiete.es/solarland.gestsiete.es

# Ver si Node está corriendo
ps aux | grep node

# Ver logs
tail -n 100 /var/log/plesk-nodejs/solarland.gestsiete.es.log

# Probar manualmente
node app.js

# Ver si el puerto está ocupado
netstat -tulpn | grep 3000

# Instalar dependencias
npm install

# Probar servidor simple
node -e "require('http').createServer((req,res)=>res.end('OK')).listen(3000)"
```

## 🎯 Resultado Esperado

Cuando funcione correctamente:
1. https://solarland.gestsiete.es/api/health → {"status":"OK",...}
2. Login funcionará sin error 502
3. En Plesk verás "Running" en estado de la app

---

**NOTA**: El error 502 casi siempre significa que:
1. El servidor Node.js no está corriendo
2. Está corriendo en un puerto diferente
3. Faltan dependencias (npm install no se ejecutó)
4. Hay un error de sintaxis en el código