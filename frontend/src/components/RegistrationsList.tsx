import { useState } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import { FaEdit, FaTrash, FaQrcode, FaEnvelope, FaPhone, FaBuilding, FaWhatsapp } from 'react-icons/fa'
import { adminService } from '../services/api'
import QRCode from 'react-qr-code'

interface RegistrationsListProps {
  registrations: any[]
  onRefetch: () => void
  onSelectionChange?: (selectedIds: string[]) => void
}

const RegistrationsList = ({ registrations, onRefetch, onSelectionChange }: RegistrationsListProps) => {
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null)
  const [showQRModal, setShowQRModal] = useState(false)
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [whatsappMessage, setWhatsappMessage] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await adminService.updateRegistrationStatus(id, newStatus)
      toast.success('Estado actualizado correctamente')
      onRefetch()
    } catch (error) {
      toast.error('Error al actualizar el estado')
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta inscripción?')) {
      try {
        await adminService.deleteRegistration(id)
        toast.success('Inscripción eliminada correctamente')
        onRefetch()
      } catch (error) {
        toast.error('Error al eliminar la inscripción')
      }
    }
  }

  const formatPhoneForWhatsApp = (phone: string): string => {
    // Eliminar espacios, guiones y paréntesis
    let cleaned = phone.replace(/[\s\-\(\)]/g, '')
    
    // Si empieza con +, dejarlo
    if (cleaned.startsWith('+')) {
      return cleaned
    }
    
    // Si empieza con 6 o 7 (móvil español), agregar +34
    if (cleaned.match(/^[67]\d{8}$/)) {
      return '+34' + cleaned
    }
    
    // Si ya tiene código de país sin +
    if (cleaned.startsWith('34')) {
      return '+' + cleaned
    }
    
    // Por defecto, asumir España si es un número de 9 dígitos
    if (cleaned.length === 9) {
      return '+34' + cleaned
    }
    
    return cleaned
  }

  const handleWhatsApp = (registration: any) => {
    setSelectedRegistration(registration)
    
    // Mensaje predeterminado
    const defaultMessage = `Hola ${registration.first_name},

Le confirmamos su inscripción al evento "Curso Presencial SolarEdge - Optimización Real" del 2 de octubre en Fuerteventura.

Su código de confirmación es: ${registration.confirmation_code}

Lugar: Solarland S.L.
Dirección: C/ La Vista, 6. Villaverde, La Oliva - Fuerteventura
Hora: 15:00 - 20:30

¡Le esperamos!

Saludos,
Equipo SolarEdge - Solarland`
    
    setWhatsappMessage(defaultMessage)
    setShowWhatsAppModal(true)
  }

  const sendWhatsApp = () => {
    if (!selectedRegistration) return
    
    const phone = formatPhoneForWhatsApp(selectedRegistration.phone)
    const encodedMessage = encodeURIComponent(whatsappMessage)
    
    // URL de WhatsApp Web/Business
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`
    
    // Abrir en nueva ventana
    window.open(whatsappUrl, '_blank')
    
    toast.success('Abriendo WhatsApp...')
    setShowWhatsAppModal(false)
  }

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = new Set(registrations.map(r => r.id))
      setSelectedIds(allIds)
      onSelectionChange?.(Array.from(allIds))
    } else {
      setSelectedIds(new Set())
      onSelectionChange?.([])
    }
  }

  const handleSelectOne = (id: string) => {
    const newSelectedIds = new Set(selectedIds)
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id)
    } else {
      newSelectedIds.add(id)
    }
    setSelectedIds(newSelectedIds)
    onSelectionChange?.(Array.from(newSelectedIds))
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Confirmado' },
      waitlist: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Lista Espera' },
      attended: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Asistió' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelado' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.cancelled
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={registrations.length > 0 && selectedIds.size === registrations.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inscrito
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {registrations.map((registration) => (
                <motion.tr
                  key={registration.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-3 py-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedIds.has(registration.id)}
                      onChange={() => handleSelectOne(registration.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {registration.first_name} {registration.last_name}
                      </div>
                      {registration.position && (
                        <div className="text-sm text-gray-500">{registration.position}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="flex items-center gap-1 text-gray-900">
                        <FaEnvelope className="text-gray-400" />
                        {registration.email}
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <FaPhone className="text-gray-400" />
                        {registration.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-900">
                      <FaBuilding className="text-gray-400" />
                      {registration.company}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={registration.status}
                      onChange={(e) => handleStatusChange(registration.id, e.target.value)}
                      className="text-sm border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="confirmed">Confirmado</option>
                      <option value="waitlist">Lista Espera</option>
                      <option value="attended">Asistió</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedRegistration(registration)
                        setShowQRModal(true)
                      }}
                      className="text-sm font-mono text-primary-600 hover:text-primary-700 flex items-center gap-1"
                    >
                      <FaQrcode />
                      {registration.confirmation_code}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(registration.created_at), 'dd/MM/yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleWhatsApp(registration)}
                        className="text-green-600 hover:text-green-700"
                        title="Enviar WhatsApp"
                      >
                        <FaWhatsapp className="text-lg" />
                      </button>
                      <button
                        onClick={() => handleDelete(registration.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {registrations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron inscripciones</p>
            </div>
          )}
        </div>
      </div>

      {/* QR Modal */}
      {showQRModal && selectedRegistration && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowQRModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-center">
              Código QR de Inscripción
            </h3>
            <div className="flex justify-center mb-4">
              <QRCode value={selectedRegistration.confirmation_code} size={200} />
            </div>
            <p className="text-center text-sm text-gray-600 mb-2">
              {selectedRegistration.first_name} {selectedRegistration.last_name}
            </p>
            <p className="text-center font-mono font-bold text-primary-600">
              {selectedRegistration.confirmation_code}
            </p>
            <button
              onClick={() => setShowQRModal(false)}
              className="btn-secondary w-full mt-4"
            >
              Cerrar
            </button>
          </motion.div>
        </div>
      )}

      {/* WhatsApp Modal */}
      {showWhatsAppModal && selectedRegistration && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowWhatsAppModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <FaWhatsapp className="text-3xl text-green-600" />
              <div>
                <h3 className="text-lg font-semibold">
                  Enviar WhatsApp a {selectedRegistration.first_name} {selectedRegistration.last_name}
                </h3>
                <p className="text-sm text-gray-600">
                  📱 {selectedRegistration.phone} | 🏢 {selectedRegistration.company}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje a enviar:
              </label>
              <textarea
                value={whatsappMessage}
                onChange={(e) => setWhatsappMessage(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                rows={12}
              />
              <p className="text-xs text-gray-500 mt-1">
                Puedes editar el mensaje antes de enviar
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> Se abrirá WhatsApp Web o WhatsApp Business en una nueva ventana. 
                Asegúrate de tener WhatsApp Web configurado en tu navegador.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-amber-800">
                <strong>⚠️ Formato del teléfono:</strong> El sistema intentará formatear automáticamente el número 
                con el código de país (+34 para España). Si el número no es español, asegúrate de incluir el 
                código de país completo.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={sendWhatsApp}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex-1 flex items-center justify-center gap-2"
              >
                <FaWhatsapp />
                Enviar WhatsApp
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}

export default RegistrationsList