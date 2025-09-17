import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { 
  FaEnvelope, FaSave, FaPaperPlane, FaLock, FaServer,
  FaCheckCircle, FaExclamationTriangle, FaInfoCircle 
} from 'react-icons/fa'
import api from '../services/api'

interface SMTPConfig {
  SMTP_HOST: string
  SMTP_PORT: string
  SMTP_SECURE: boolean
  SMTP_USER: string
  SMTP_PASS?: string
  EMAIL_FROM: string
  SMTP_PASS_CONFIGURED?: boolean
}

interface SMTPService {
  name: string
  host: string
  port: number
  secure: boolean
  note: string
}

const SMTPConfig = () => {
  const [config, setConfig] = useState<SMTPConfig>({
    SMTP_HOST: '',
    SMTP_PORT: '587',
    SMTP_SECURE: false,
    SMTP_USER: '',
    SMTP_PASS: '',
    EMAIL_FROM: ''
  })
  
  const [services, setServices] = useState<SMTPService[]>([])
  const [selectedService, setSelectedService] = useState<string>('Personalizado')
  const [testEmail, setTestEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    loadConfig()
    loadServices()
  }, [])

  const loadConfig = async () => {
    try {
      const response = await api.get('/config/smtp')
      setConfig(response.data.config)
    } catch (error) {
      toast.error('Error al cargar la configuración SMTP')
    }
  }

  const loadServices = async () => {
    try {
      const response = await api.get('/config/smtp/services')
      setServices(response.data.services)
    } catch (error) {
      console.error('Error loading SMTP services:', error)
    }
  }

  const handleServiceChange = (serviceName: string) => {
    setSelectedService(serviceName)
    const service = services.find(s => s.name === serviceName)
    
    if (service && service.name !== 'Personalizado') {
      setConfig(prev => ({
        ...prev,
        SMTP_HOST: service.host,
        SMTP_PORT: String(service.port),
        SMTP_SECURE: service.secure
      }))
    }
  }

  const handleSave = async () => {
    if (!config.SMTP_HOST || !config.SMTP_USER) {
      toast.error('Por favor completa los campos obligatorios')
      return
    }

    setIsLoading(true)
    try {
      // Si no se ha modificado la contraseña, no la enviamos
      const dataToSend = { ...config }
      if (dataToSend.SMTP_PASS === '') {
        delete dataToSend.SMTP_PASS
      }

      await api.put('/config/smtp', dataToSend)
      toast.success('Configuración SMTP guardada correctamente')
      
      // Recargar configuración para actualizar el estado
      await loadConfig()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar la configuración')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTest = async () => {
    if (!testEmail) {
      toast.error('Por favor ingresa un email de prueba')
      return
    }

    setIsTesting(true)
    try {
      const response = await api.post('/config/smtp/test', { testEmail })
      toast.success(response.data.message)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al enviar email de prueba')
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Configuración de Email (SMTP)
        </h2>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <FaInfoCircle className="text-blue-600 mt-1 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Información importante:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Los emails de confirmación se enviarán usando esta configuración</li>
                <li>Para Gmail: Necesitas una "Contraseña de aplicación" (no tu contraseña normal)</li>
                <li>Algunos servicios requieren verificación en 2 pasos activada</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Selector de servicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Servicio de Email
            </label>
            <select
              value={selectedService}
              onChange={(e) => handleServiceChange(e.target.value)}
              className="input-field"
            >
              {services.map(service => (
                <option key={service.name} value={service.name}>
                  {service.name}
                </option>
              ))}
            </select>
            {selectedService && services.find(s => s.name === selectedService)?.note && (
              <p className="mt-1 text-xs text-gray-600">
                {services.find(s => s.name === selectedService)?.note}
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Host SMTP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Servidor SMTP *
              </label>
              <div className="relative">
                <FaServer className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={config.SMTP_HOST}
                  onChange={(e) => setConfig({ ...config, SMTP_HOST: e.target.value })}
                  className="input-field pl-10"
                  placeholder="smtp.gmail.com"
                  required
                />
              </div>
            </div>

            {/* Puerto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Puerto *
              </label>
              <input
                type="number"
                value={config.SMTP_PORT}
                onChange={(e) => setConfig({ ...config, SMTP_PORT: e.target.value })}
                className="input-field"
                placeholder="587"
                required
              />
            </div>

            {/* Usuario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuario/Email *
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={config.SMTP_USER}
                  onChange={(e) => setConfig({ ...config, SMTP_USER: e.target.value })}
                  className="input-field pl-10"
                  placeholder="tu-email@gmail.com"
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña {config.SMTP_PASS_CONFIGURED && '(Configurada)'}
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={config.SMTP_PASS || ''}
                  onChange={(e) => setConfig({ ...config, SMTP_PASS: e.target.value })}
                  className="input-field pl-10 pr-24"
                  placeholder={config.SMTP_PASS_CONFIGURED ? '(Sin cambios)' : 'Contraseña'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-primary-600 hover:text-primary-700"
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              {selectedService === 'Gmail' && (
                <a
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary-600 hover:text-primary-700 mt-1 inline-block"
                >
                  Generar contraseña de aplicación →
                </a>
              )}
            </div>

            {/* Email From */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email de Remitente *
              </label>
              <input
                type="text"
                value={config.EMAIL_FROM}
                onChange={(e) => setConfig({ ...config, EMAIL_FROM: e.target.value })}
                className="input-field"
                placeholder='"SolarEdge Event" <noreply@solarland.es>'
                required
              />
              <p className="mt-1 text-xs text-gray-600">
                Formato: "Nombre" &lt;email@dominio.com&gt;
              </p>
            </div>
          </div>

          {/* Conexión segura */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="secure"
              checked={config.SMTP_SECURE}
              onChange={(e) => setConfig({ ...config, SMTP_SECURE: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="secure" className="text-sm text-gray-700">
              Usar conexión segura (SSL/TLS)
            </label>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="btn-primary flex items-center gap-2"
            >
              <FaSave />
              {isLoading ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </div>
      </div>

      {/* Sección de prueba */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Probar Configuración
        </h3>
        
        <div className="flex gap-3">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="input-field flex-1"
            placeholder="email-de-prueba@ejemplo.com"
          />
          <button
            onClick={handleTest}
            disabled={isTesting || !config.SMTP_HOST}
            className="btn-secondary flex items-center gap-2"
          >
            <FaPaperPlane />
            {isTesting ? 'Enviando...' : 'Enviar Email de Prueba'}
          </button>
        </div>
        
        {!config.SMTP_HOST && (
          <p className="mt-2 text-sm text-amber-600">
            <FaExclamationTriangle className="inline mr-1" />
            Primero guarda una configuración SMTP válida
          </p>
        )}
      </div>

      {/* Estado actual */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Estado de la Configuración
        </h3>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {config.SMTP_HOST ? (
              <FaCheckCircle className="text-green-500" />
            ) : (
              <FaExclamationTriangle className="text-amber-500" />
            )}
            <span className="text-sm">
              Servidor SMTP: {config.SMTP_HOST || 'No configurado'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {config.SMTP_USER ? (
              <FaCheckCircle className="text-green-500" />
            ) : (
              <FaExclamationTriangle className="text-amber-500" />
            )}
            <span className="text-sm">
              Usuario: {config.SMTP_USER || 'No configurado'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {config.SMTP_PASS_CONFIGURED ? (
              <FaCheckCircle className="text-green-500" />
            ) : (
              <FaExclamationTriangle className="text-amber-500" />
            )}
            <span className="text-sm">
              Contraseña: {config.SMTP_PASS_CONFIGURED ? 'Configurada' : 'No configurada'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SMTPConfig