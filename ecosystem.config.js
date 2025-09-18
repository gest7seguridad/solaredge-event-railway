// Configuración de PM2 para producción
module.exports = {
  apps: [{
    name: 'event-system',
    script: './app.js',
    instances: 'max', // Usar todos los cores disponibles
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    // Auto restart si la app crashea
    autorestart: true,
    // Máximo de reinicios
    max_restarts: 10,
    // Tiempo entre reinicios
    min_uptime: '10s',
    // Configuración de watch (desactivado en producción)
    watch: false,
    // Ignorar watch para estos directorios
    ignore_watch: ['node_modules', 'logs', 'frontend', '.git'],
    // Variables de entorno desde archivo
    env_file: '.env',
    // Merge logs
    merge_logs: true,
    // Configuración de monitoreo
    monitoring: {
      http: true,
      https: true,
      http_latency: true,
      http_code: true,
      probes: true
    }
  }]
};