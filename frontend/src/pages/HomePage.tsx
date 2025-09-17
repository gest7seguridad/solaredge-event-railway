import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from 'react-query'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Countdown from 'react-countdown'
import { FaCalendar, FaClock, FaMapMarkerAlt, FaParking, FaUsers, FaCheckCircle, FaUserShield } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { eventService } from '../services/api'
import RegistrationForm from '../components/RegistrationForm'
import EventAgenda from '../components/EventAgenda'
import LoadingSpinner from '../components/LoadingSpinner'

const HomePage = () => {
  const [showForm, setShowForm] = useState(false)
  const [organizerLogo, setOrganizerLogo] = useState<string>('/logos/solarland-logo.png')
  const [collaboratorLogo, setCollaboratorLogo] = useState<string>('/logos/solaredge-logo.png')
  const navigate = useNavigate()

  const { data, isLoading, error } = useQuery(
    'currentEvent',
    async () => {
      const response = await eventService.getCurrentEvent()
      return response.data
    }
  )

  useEffect(() => {
    const savedOrganizerLogo = localStorage.getItem('organizerLogo')
    const savedCollaboratorLogo = localStorage.getItem('collaboratorLogo')
    
    if (savedOrganizerLogo) setOrganizerLogo(savedOrganizerLogo)
    if (savedCollaboratorLogo) setCollaboratorLogo(savedCollaboratorLogo)
  }, [])

  if (isLoading) return <LoadingSpinner />
  if (error || !data?.event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700">No hay eventos disponibles</h2>
          <p className="mt-2 text-gray-500">Por favor, vuelve más tarde</p>
        </div>
      </div>
    )
  }

  const event = data.event
  const eventDate = new Date(event.event_date)
  const agenda = typeof event.agenda === 'string' ? JSON.parse(event.agenda || '[]') : (event.agenda || [])
  const spotsAvailable = event.available_spots > 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Botón discreto de acceso admin - esquina superior derecha */}
      <button
        onClick={() => navigate('/admin')}
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200 opacity-30 hover:opacity-100"
        title="Acceso Administración"
        aria-label="Acceso panel de administración"
      >
        <FaUserShield className="text-gray-600 text-lg" />
      </button>
      
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 gradient-bg opacity-5"></div>
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="text-center">
            {/* Logos */}
            <div className="flex justify-center items-center gap-8 mb-8">
              <motion.img 
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                src={organizerLogo} 
                alt="Solarland" 
                className="h-24 lg:h-32 object-contain"
                style={{ maxWidth: '250px' }}
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-light text-gray-400"
              >
                &
              </motion.div>
              <motion.img 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                src={collaboratorLogo} 
                alt="SolarEdge" 
                className="h-16 lg:h-20 object-contain"
                style={{ maxWidth: '200px' }}
              />
            </div>

            {/* Title */}
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl lg:text-6xl font-bold text-gray-800 mb-4"
            >
              {event.title}
            </motion.h1>
            
            {/* Countdown */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <Countdown
                date={eventDate}
                renderer={({ days, hours, minutes, completed }) => {
                  if (completed) {
                    return <span className="text-xl text-primary-600">¡El evento ha comenzado!</span>
                  }
                  return (
                    <div className="flex justify-center gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary-600">{days}</div>
                        <div className="text-sm text-gray-600">Días</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary-600">{hours}</div>
                        <div className="text-sm text-gray-600">Horas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary-600">{minutes}</div>
                        <div className="text-sm text-gray-600">Minutos</div>
                      </div>
                    </div>
                  )
                }}
              />
            </motion.div>

            {/* Event Info */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8"
            >
              <div className="flex items-center justify-center gap-2 text-gray-700">
                <FaCalendar className="text-primary-500" />
                <span>{format(eventDate, "d 'de' MMMM", { locale: es })}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-700">
                <FaClock className="text-primary-500" />
                <span>{format(eventDate, "HH:mm")} - 20:30</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-700">
                <FaMapMarkerAlt className="text-primary-500" />
                <span>{event.venue_city}</span>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {spotsAvailable ? (
                <div>
                  <button
                    onClick={() => setShowForm(true)}
                    className="btn-primary text-lg px-8 py-4"
                  >
                    Inscríbete Ahora
                  </button>
                  <p className="mt-4 text-sm text-gray-600">
                    <FaUsers className="inline mr-1" />
                    {event.available_spots} plazas disponibles de {event.max_attendees}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-xl text-red-600 font-semibold">Evento Completo</p>
                  <p className="mt-2 text-gray-600">Puedes inscribirte en la lista de espera</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-4 btn-secondary"
                  >
                    Unirse a Lista de Espera
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Description Section */}
      <section className="section-padding bg-white">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="card"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Sobre el Evento</h2>
            <div className="prose prose-lg text-gray-600 whitespace-pre-line">
              {event.description}
            </div>
            <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded">
              <p className="flex items-center gap-2 text-amber-800">
                <FaParking className="text-xl" />
                <strong>Aparcamiento gratuito disponible</strong>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Agenda Section */}
      <section className="section-padding">
        <div className="container mx-auto max-w-4xl">
          <EventAgenda agenda={agenda} />
        </div>
      </section>

      {/* Venue Section */}
      <section className="section-padding bg-white">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="card"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Ubicación</h2>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-gray-700">{event.venue_name}</p>
              <p className="text-gray-600">{event.venue_address}</p>
              <p className="text-gray-600">{event.venue_city}</p>
            </div>
            {event.venue_google_maps_url && (
              <a
                href={event.venue_google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 btn-secondary"
              >
                Ver en Google Maps
              </a>
            )}
          </motion.div>
        </div>
      </section>

      {/* Registration Modal */}
      {showForm && (
        <RegistrationForm
          event={event}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}

export default HomePage