import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { FaTimes, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'
import { registrationService } from '../services/api'
import QRCode from 'react-qr-code'

interface RegistrationFormProps {
  event: any
  onClose: () => void
}

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  position?: string
  nifCif?: string
  acceptTerms: boolean
}

const RegistrationForm = ({ event, onClose }: RegistrationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState<any>(null)
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const response = await registrationService.register({
        ...data,
        eventId: event.id
      })
      
      setRegistrationSuccess(response.data)
      toast.success(response.data.message)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al procesar la inscripción')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (registrationSuccess) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl max-w-md w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <FaCheckCircle className="text-4xl text-green-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                ¡Inscripción Confirmada!
              </h2>
              
              <p className="text-gray-600 mb-6">
                {registrationSuccess.registration.status === 'confirmed' 
                  ? 'Tu inscripción ha sido confirmada. Recibirás un email con todos los detalles.'
                  : 'Has sido añadido a la lista de espera. Te contactaremos si hay plazas disponibles.'}
              </p>

              {registrationSuccess.registration.confirmationCode && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600 mb-2">Tu código de confirmación:</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {registrationSuccess.registration.confirmationCode}
                  </p>
                  <div className="mt-4 flex justify-center">
                    <QRCode 
                      value={registrationSuccess.registration.confirmationCode}
                      size={150}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Presenta este código QR en la entrada
                  </p>
                </div>
              )}

              <button onClick={onClose} className="btn-primary w-full">
                Cerrar
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl max-w-2xl w-full my-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                Formulario de Inscripción
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  {...register('firstName', { required: 'El nombre es obligatorio' })}
                  className="input-field"
                  placeholder="Tu nombre"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellidos *
                </label>
                <input
                  {...register('lastName', { required: 'Los apellidos son obligatorios' })}
                  className="input-field"
                  placeholder="Tus apellidos"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  {...register('email', { 
                    required: 'El email es obligatorio',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido'
                    }
                  })}
                  className="input-field"
                  placeholder="tu@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <input
                  {...register('phone', { required: 'El teléfono es obligatorio' })}
                  className="input-field"
                  placeholder="600 123 456"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa *
                </label>
                <input
                  {...register('company', { required: 'La empresa es obligatoria' })}
                  className="input-field"
                  placeholder="Nombre de tu empresa"
                />
                {errors.company && (
                  <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cargo
                </label>
                <input
                  {...register('position')}
                  className="input-field"
                  placeholder="Tu cargo (opcional)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NIF/CIF
              </label>
              <input
                {...register('nifCif')}
                className="input-field"
                placeholder="NIF o CIF (opcional)"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  {...register('acceptTerms', { 
                    required: 'Debes aceptar los términos y condiciones' 
                  })}
                  className="mt-1"
                />
                <span className="text-sm text-gray-600">
                  Acepto que mis datos sean utilizados para la gestión de este evento 
                  y comunicaciones relacionadas. Los datos serán tratados conforme a la 
                  normativa de protección de datos vigente.
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="mt-1 text-sm text-red-600">{errors.acceptTerms.message}</p>
              )}
            </div>

            {event.available_spots <= 10 && event.available_spots > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 text-sm flex items-center gap-2">
                  <FaExclamationCircle />
                  Solo quedan {event.available_spots} plazas disponibles
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Procesando...' : 'Confirmar Inscripción'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default RegistrationForm