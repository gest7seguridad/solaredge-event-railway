import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { 
  FaUsers, FaCheckCircle, FaClock, FaDownload, FaSearch, 
  FaSignOutAlt, FaQrcode, FaTrash, FaEdit, FaFilter,
  FaChartBar, FaCalendar, FaBuilding, FaWhatsapp
} from 'react-icons/fa'
import { adminService } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import RegistrationsList from '../components/RegistrationsList'
import DashboardStats from '../components/DashboardStats'
import LogoUploader from '../components/LogoUploader'
import EventListComplete from '../components/EventListComplete'
import SMTPConfig from '../components/SMTPConfig'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>([])
  const [showBulkWhatsApp, setShowBulkWhatsApp] = useState(false)
  const [bulkWhatsappMessage, setBulkWhatsappMessage] = useState('')
  
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/admin')
    }
  }, [navigate])

  const { data: statsData, isLoading: statsLoading } = useQuery(
    'dashboardStats',
    async () => {
      const response = await adminService.getDashboardStats()
      return response.data
    }
  )

  const { 
    data: registrationsData, 
    isLoading: registrationsLoading,
    refetch 
  } = useQuery(
    ['registrations', searchTerm, filterStatus],
    async () => {
      const response = await adminService.getRegistrations({
        search: searchTerm,
        status: filterStatus
      })
      return response.data
    }
  )

  const handleExport = async () => {
    try {
      const response = await adminService.exportRegistrations()
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `inscripciones_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      toast.success('Archivo exportado correctamente')
    } catch (error) {
      toast.error('Error al exportar los datos')
    }
  }

  const handleBulkWhatsApp = () => {
    if (selectedRegistrations.length === 0) {
      toast.warning('Por favor selecciona al menos un inscrito')
      return
    }
    
    const selectedData = registrations.filter(r => selectedRegistrations.includes(r.id))
    const names = selectedData.map(r => r.first_name).join(', ')
    
    // Mensaje predeterminado para múltiples usuarios
    const defaultMessage = `Hola,

Le confirmamos su inscripción al evento "Curso Presencial SolarEdge - Optimización Real" del 2 de octubre en Fuerteventura.

Lugar: Solarland S.L.
Dirección: C/ La Vista, 6. Villaverde, La Oliva - Fuerteventura
Hora: 15:00 - 20:30

¡Le esperamos!

Saludos,
Equipo SolarEdge - Solarland`
    
    setBulkWhatsappMessage(defaultMessage)
    setShowBulkWhatsApp(true)
  }

  const sendBulkWhatsApp = () => {
    const selectedData = registrations.filter(r => selectedRegistrations.includes(r.id))
    
    selectedData.forEach((registration, index) => {
      setTimeout(() => {
        const phone = formatPhoneForWhatsApp(registration.phone)
        const personalizedMessage = bulkWhatsappMessage
          .replace('{nombre}', registration.first_name)
          .replace('{apellido}', registration.last_name)
          .replace('{empresa}', registration.company)
          .replace('{codigo}', registration.confirmation_code)
        
        const encodedMessage = encodeURIComponent(personalizedMessage)
        const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`
        
        window.open(whatsappUrl, '_blank')
      }, index * 2000) // Esperar 2 segundos entre cada mensaje
    })
    
    toast.success(`Abriendo WhatsApp para ${selectedData.length} contactos...`)
    setShowBulkWhatsApp(false)
    setSelectedRegistrations([])
  }

  const formatPhoneForWhatsApp = (phone: string): string => {
    let cleaned = phone.replace(/[\s\-\(\)]/g, '')
    if (cleaned.startsWith('+')) return cleaned
    if (cleaned.match(/^[67]\d{8}$/)) return '+34' + cleaned
    if (cleaned.startsWith('34')) return '+' + cleaned
    if (cleaned.length === 9) return '+34' + cleaned
    return cleaned
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/admin')
  }

  if (statsLoading || registrationsLoading) return <LoadingSpinner />

  const stats = statsData?.stats || {}
  const registrations = registrationsData?.registrations || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Panel de Administración</h1>
              <p className="text-sm text-gray-600">Bienvenido, {user.name}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/check-in')}
                className="btn-secondary flex items-center gap-2"
              >
                <FaQrcode /> Check-in
              </button>
              <button
                onClick={handleLogout}
                className="btn-secondary flex items-center gap-2"
              >
                <FaSignOutAlt /> Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-1 border-b-2 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Vista General
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`py-3 px-1 border-b-2 font-medium transition-colors ${
                activeTab === 'events'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Eventos
            </button>
            <button
              onClick={() => setActiveTab('registrations')}
              className={`py-3 px-1 border-b-2 font-medium transition-colors ${
                activeTab === 'registrations'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Inscripciones
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-3 px-1 border-b-2 font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Configuración
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Inscritos</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.total || 0}</p>
                  </div>
                  <FaUsers className="text-4xl text-primary-500 opacity-50" />
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Confirmados</p>
                    <p className="text-3xl font-bold text-green-600">{stats.confirmed || 0}</p>
                  </div>
                  <FaCheckCircle className="text-4xl text-green-500 opacity-50" />
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Lista de Espera</p>
                    <p className="text-3xl font-bold text-amber-600">{stats.waitlist || 0}</p>
                  </div>
                  <FaClock className="text-4xl text-amber-500 opacity-50" />
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Asistieron</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.attended || 0}</p>
                  </div>
                  <FaCheckCircle className="text-4xl text-blue-500 opacity-50" />
                </div>
              </div>
            </div>

            {/* Charts and Stats */}
            <DashboardStats 
              dailyRegistrations={statsData?.dailyRegistrations || []}
              companiesStats={statsData?.companiesStats || []}
              recentRegistrations={statsData?.recentRegistrations || []}
            />
          </motion.div>
        )}

        {/* Registrations Tab */}
        {activeTab === 'registrations' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Filters */}
            <div className="bg-white rounded-lg p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, email, empresa o código..."
                    className="input-field pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <select
                  className="input-field md:w-48"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">Todos los estados</option>
                  <option value="confirmed">Confirmados</option>
                  <option value="waitlist">Lista de espera</option>
                  <option value="attended">Asistieron</option>
                  <option value="cancelled">Cancelados</option>
                </select>

                <button
                  onClick={handleExport}
                  className="btn-primary flex items-center gap-2"
                >
                  <FaDownload /> Exportar CSV
                </button>
                
                {selectedRegistrations.length > 0 && (
                  <button
                    onClick={handleBulkWhatsApp}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <FaWhatsapp /> WhatsApp ({selectedRegistrations.length})
                  </button>
                )}
              </div>
            </div>

            {/* Registrations List */}
            <RegistrationsList 
              registrations={registrations}
              onRefetch={refetch}
              onSelectionChange={setSelectedRegistrations}
            />
          </motion.div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <EventListComplete />
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <SMTPConfig />
            
            <div className="card mb-6 mt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Logos del Evento</h2>
              <p className="text-gray-600 mb-6">
                Sube los logos de las empresas organizadoras para personalizar la página del evento.
              </p>
              <LogoUploader />
            </div>

            <div className="card">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Información del Administrador</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nombre</p>
                  <p className="font-medium">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rol</p>
                  <p className="font-medium capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modal de WhatsApp Masivo */}
      {showBulkWhatsApp && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowBulkWhatsApp(false)}
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
                  Enviar WhatsApp a {selectedRegistrations.length} inscritos
                </h3>
                <p className="text-sm text-gray-600">
                  Se abrirán múltiples ventanas de WhatsApp Web
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje a enviar:
              </label>
              <textarea
                value={bulkWhatsappMessage}
                onChange={(e) => setBulkWhatsappMessage(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                rows={12}
              />
              <div className="mt-2 text-xs text-gray-600">
                <p className="font-semibold mb-1">Variables disponibles:</p>
                <ul className="list-disc list-inside">
                  <li>{'{nombre}'} - Nombre del inscrito</li>
                  <li>{'{apellido}'} - Apellido del inscrito</li>
                  <li>{'{empresa}'} - Empresa del inscrito</li>
                  <li>{'{codigo}'} - Código de confirmación</li>
                </ul>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-amber-800">
                <strong>⚠️ Importante:</strong> Se abrirá una ventana de WhatsApp cada 2 segundos. 
                Permite las ventanas emergentes en tu navegador y ten WhatsApp Web configurado.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>💡 Consejo:</strong> Para evitar ser marcado como spam, es recomendable 
                personalizar el mensaje y no enviar a más de 20 contactos a la vez.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkWhatsApp(false)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={sendBulkWhatsApp}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex-1 flex items-center justify-center gap-2"
              >
                <FaWhatsapp />
                Enviar a {selectedRegistrations.length} contactos
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard