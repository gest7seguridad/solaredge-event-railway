import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FaQrcode, FaCheckCircle, FaTimesCircle, FaArrowLeft } from 'react-icons/fa'
import { registrationService } from '../services/api'

const CheckIn = () => {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [lastCheckedIn, setLastCheckedIn] = useState<any>(null)

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) {
      toast.error('Por favor ingresa un código')
      return
    }

    setIsLoading(true)
    try {
      const response = await registrationService.checkIn(code.toUpperCase())
      setLastCheckedIn(response.data.attendee)
      toast.success(response.data.message)
      setCode('')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al realizar check-in')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="mb-6 flex items-center gap-2 text-primary-700 hover:text-primary-800 transition-colors"
        >
          <FaArrowLeft /> Volver al Dashboard
        </button>

        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <div className="text-center mb-8">
              <div className="mx-auto w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <FaQrcode className="text-5xl text-primary-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Check-in de Asistentes</h1>
              <p className="text-gray-600 mt-2">
                Escanea el código QR o ingresa el código manualmente
              </p>
            </div>

            <form onSubmit={handleCheckIn} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Confirmación
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Ej: AB12CD34"
                  className="input-field text-center text-2xl font-mono uppercase"
                  disabled={isLoading}
                  autoFocus
                />
                <p className="mt-2 text-sm text-gray-500 text-center">
                  Ingresa el código de 8 caracteres del ticket
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full text-lg"
              >
                {isLoading ? 'Verificando...' : 'Registrar Entrada'}
              </button>
            </form>

            {lastCheckedIn && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-8 p-6 bg-green-50 border-2 border-green-200 rounded-lg"
              >
                <div className="flex items-start gap-4">
                  <FaCheckCircle className="text-3xl text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">
                      ¡Check-in Exitoso!
                    </h3>
                    <p className="text-green-700 mt-1">
                      <strong>{lastCheckedIn.name}</strong>
                    </p>
                    <p className="text-green-600 text-sm">
                      {lastCheckedIn.company}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center text-sm text-gray-600">
                <p>💡 Tip: Puedes usar un lector de códigos QR conectado</p>
                <p>que escriba automáticamente el código en el campo</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default CheckIn