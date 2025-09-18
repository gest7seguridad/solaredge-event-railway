import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import {
  FaPlus, FaEdit, FaTrash, FaCalendar, FaMapMarkerAlt,
  FaUsers, FaTimes, FaSave, FaEye, FaEyeSlash, FaClock,
  FaGlobe, FaListUl
} from 'react-icons/fa'
import { eventService } from '../services/api'

interface Event {
  id?: number
  title: string
  description: string
  date?: string
  time?: string
  location?: string
  capacity?: number
  image_url?: string
  is_active?: boolean
  // Campos adicionales del formulario original
  event_date?: string
  registration_deadline?: string
  venue_name?: string
  venue_address?: string
  venue_city?: string
  venue_postal_code?: string
  venue_google_maps_url?: string
  google_maps_url?: string
  max_attendees?: number
  enable_waitlist?: boolean
  agenda?: any[]
  registration_info?: string
  requirements?: string
  materials?: string
  tags?: string[]
  facebook_url?: string
  twitter_url?: string
  organizer_name?: string
  organizer_email?: string
  organizer_phone?: string
}

const EventListComplete = () => {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  const { data: events = [], isLoading, error } = useQuery(
    'allEvents',
    async () => {
      const response = await eventService.getAllEvents()
      console.log('Events response:', response.data)
      // The backend returns the array directly, and axios wraps it in response.data
      // Ensure we always return an array
      return Array.isArray(response.data) ? response.data : []
    },
    {
      onError: (error: any) => {
        console.error('Error loading events:', error)
        toast.error('Error al cargar los eventos')
      }
    }
  )

  const createMutation = useMutation(
    (eventData: Event) => {
      // Enviar todos los campos al backend ahora que soporta campos adicionales
      const backendData = {
        title: eventData.title,
        description: eventData.description,
        date: eventData.event_date || eventData.date,
        time: eventData.time || '10:00:00',
        location: `${eventData.venue_name || ''} - ${eventData.venue_address || ''} - ${eventData.venue_city || ''}`.trim(),
        capacity: eventData.max_attendees || eventData.capacity || 0,
        image_url: eventData.image_url || '',
        is_active: eventData.is_active !== false,
        // Campos adicionales
        venue_name: eventData.venue_name,
        venue_address: eventData.venue_address,
        venue_city: eventData.venue_city,
        venue_postal_code: eventData.venue_postal_code,
        google_maps_url: eventData.google_maps_url,
        agenda: eventData.agenda,
        registration_deadline: eventData.registration_deadline,
        registration_info: eventData.registration_info,
        requirements: eventData.requirements,
        materials: eventData.materials,
        tags: eventData.tags,
        facebook_url: eventData.facebook_url,
        twitter_url: eventData.twitter_url,
        organizer_name: eventData.organizer_name,
        organizer_email: eventData.organizer_email,
        organizer_phone: eventData.organizer_phone,
        max_attendees: eventData.max_attendees
      }
      return eventService.createEvent(backendData)
    },
    {
      onSuccess: () => {
        toast.success('Evento creado correctamente')
        queryClient.invalidateQueries('allEvents')
        setShowForm(false)
        setEditingEvent(null)
      },
      onError: () => {
        toast.error('Error al crear el evento')
      }
    }
  )

  const updateMutation = useMutation(
    ({ id, data }: { id: number; data: Event }) => {
      const backendData = {
        title: data.title,
        description: data.description,
        date: data.event_date || data.date,
        time: data.time || '10:00:00',
        location: `${data.venue_name || ''} - ${data.venue_address || ''} - ${data.venue_city || ''}`.trim(),
        capacity: data.max_attendees || data.capacity || 0,
        image_url: data.image_url || '',
        is_active: data.is_active !== false,
        // Campos adicionales
        venue_name: data.venue_name,
        venue_address: data.venue_address,
        venue_city: data.venue_city,
        venue_postal_code: data.venue_postal_code,
        google_maps_url: data.google_maps_url,
        agenda: data.agenda,
        registration_deadline: data.registration_deadline,
        registration_info: data.registration_info,
        requirements: data.requirements,
        materials: data.materials,
        tags: data.tags,
        facebook_url: data.facebook_url,
        twitter_url: data.twitter_url,
        organizer_name: data.organizer_name,
        organizer_email: data.organizer_email,
        organizer_phone: data.organizer_phone,
        max_attendees: data.max_attendees
      }
      return eventService.updateEvent(id.toString(), backendData)
    },
    {
      onSuccess: () => {
        toast.success('Evento actualizado correctamente')
        queryClient.invalidateQueries('allEvents')
        setShowForm(false)
        setEditingEvent(null)
      },
      onError: () => {
        toast.error('Error al actualizar el evento')
      }
    }
  )

  const deleteMutation = useMutation(
    (id: number) => eventService.deleteEvent(id.toString()),
    {
      onSuccess: () => {
        toast.success('Evento eliminado correctamente')
        queryClient.invalidateQueries('allEvents')
      },
      onError: () => {
        toast.error('Error al eliminar el evento')
      }
    }
  )

  const handleSave = (formData: Event) => {
    if (editingEvent?.id) {
      updateMutation.mutate({ id: editingEvent.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (event: Event) => {
    // Parsear la location para recuperar los campos separados
    const locationParts = event.location?.split(' - ') || []

    setEditingEvent({
      ...event,
      event_date: event.date,
      venue_name: locationParts[0] || '',
      venue_address: locationParts[1] || '',
      venue_city: locationParts[2] || '',
      max_attendees: event.capacity
    })
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este evento?')) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-white rounded-lg">
        <p className="text-red-500">Error al cargar los eventos</p>
        <button onClick={() => queryClient.invalidateQueries('allEvents')} className="btn-primary mt-4">
          Reintentar
        </button>
      </div>
    )
  }

  console.log('Rendering events list, events count:', events.length, 'Events:', events)

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Eventos</h2>
        <button
          onClick={() => {
            setEditingEvent(null)
            setShowForm(true)
          }}
          className="btn-primary flex items-center gap-2"
        >
          <FaPlus /> Nuevo Evento
        </button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <FaCalendar className="text-5xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay eventos creados</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary mt-4"
          >
            Crear primer evento
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event: Event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {event.title}
                    </h3>
                    {event.is_active ? (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full flex items-center gap-1">
                        <FaEye className="text-xs" /> Activo
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full flex items-center gap-1">
                        <FaEyeSlash className="text-xs" /> Inactivo
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 mb-3">{event.description}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    {event.date && (
                      <div className="flex items-center gap-1">
                        <FaCalendar className="text-gray-400" />
                        {new Date(event.date).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    )}
                    {event.time && (
                      <div className="flex items-center gap-1">
                        <FaClock className="text-gray-400" />
                        {event.time}
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <FaMapMarkerAlt className="text-gray-400" />
                        {event.location}
                      </div>
                    )}
                    {event.capacity !== undefined && (
                      <div className="flex items-center gap-1">
                        <FaUsers className="text-gray-400" />
                        Capacidad: {event.capacity} personas
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(event)}
                    className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => event.id && handleDelete(event.id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showForm && (
        <EventFormComplete
          event={editingEvent}
          onClose={() => {
            setShowForm(false)
            setEditingEvent(null)
          }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

const EventFormComplete = ({ event, onClose, onSave }: {
  event: Event | null
  onClose: () => void
  onSave: (data: Event) => void
}) => {
  const [formData, setFormData] = useState<Event>({
    title: event?.title || '',
    description: event?.description || '',
    event_date: event?.event_date || event?.date || new Date().toISOString().split('T')[0],
    time: event?.time || '10:00',
    registration_deadline: event?.registration_deadline || new Date().toISOString().split('T')[0],
    venue_name: event?.venue_name || '',
    venue_address: event?.venue_address || '',
    venue_city: event?.venue_city || '',
    venue_google_maps_url: event?.venue_google_maps_url || '',
    max_attendees: event?.max_attendees || event?.capacity || 100,
    enable_waitlist: event?.enable_waitlist || false,
    agenda: event?.agenda || [],
    is_active: event?.is_active !== undefined ? event.is_active : true,
    image_url: event?.image_url || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const addAgendaItem = () => {
    setFormData({
      ...formData,
      agenda: [...(formData.agenda || []), { time: '', title: '', speaker: '' }]
    })
  }

  const updateAgendaItem = (index: number, field: string, value: string) => {
    const newAgenda = [...(formData.agenda || [])]
    newAgenda[index] = { ...newAgenda[index], [field]: value }
    setFormData({ ...formData, agenda: newAgenda })
  }

  const removeAgendaItem = (index: number) => {
    setFormData({
      ...formData,
      agenda: formData.agenda?.filter((_, i) => i !== index) || []
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              {event ? 'Editar Evento' : 'Nuevo Evento'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <FaTimes className="text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título del Evento *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaCalendar className="inline mr-1" />
                Fecha del Evento
              </label>
              <input
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaClock className="inline mr-1" />
                Hora del Evento
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha límite de inscripción
              </label>
              <input
                type="date"
                value={formData.registration_deadline}
                onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaUsers className="inline mr-1" />
                Capacidad máxima
              </label>
              <input
                type="number"
                value={formData.max_attendees}
                onChange={(e) => setFormData({ ...formData, max_attendees: parseInt(e.target.value) || 0 })}
                className="input-field"
                min="1"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <FaMapMarkerAlt /> Ubicación del Evento
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del lugar
                </label>
                <input
                  type="text"
                  value={formData.venue_name}
                  onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
                  className="input-field"
                  placeholder="Ej: Centro de Convenciones"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={formData.venue_city}
                  onChange={(e) => setFormData({ ...formData, venue_city: e.target.value })}
                  className="input-field"
                  placeholder="Ej: Madrid, España"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección completa
                </label>
                <input
                  type="text"
                  value={formData.venue_address}
                  onChange={(e) => setFormData({ ...formData, venue_address: e.target.value })}
                  className="input-field"
                  placeholder="Ej: Calle Mayor 123, CP 28013"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaGlobe className="inline mr-1" />
                  URL de Google Maps (opcional)
                </label>
                <input
                  type="url"
                  value={formData.venue_google_maps_url}
                  onChange={(e) => setFormData({ ...formData, venue_google_maps_url: e.target.value })}
                  className="input-field"
                  placeholder="https://maps.google.com/..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <FaListUl /> Agenda del Evento
              </h3>
              <button
                type="button"
                onClick={addAgendaItem}
                className="btn-secondary text-sm"
              >
                + Añadir ítem
              </button>
            </div>

            {formData.agenda && formData.agenda.map((item: any, index: number) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-2">
                    <input
                      type="time"
                      value={item.time || ''}
                      onChange={(e) => updateAgendaItem(index, 'time', e.target.value)}
                      className="input-field"
                      placeholder="Hora"
                    />
                  </div>
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={(e) => updateAgendaItem(index, 'title', e.target.value)}
                      className="input-field"
                      placeholder="Título de la actividad"
                    />
                  </div>
                  <div className="col-span-4">
                    <input
                      type="text"
                      value={item.speaker || ''}
                      onChange={(e) => updateAgendaItem(index, 'speaker', e.target.value)}
                      className="input-field"
                      placeholder="Ponente/Responsable"
                    />
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => removeAgendaItem(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.enable_waitlist}
                onChange={(e) => setFormData({ ...formData, enable_waitlist: e.target.checked })}
              />
              <span className="text-sm text-gray-700">Habilitar lista de espera</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <span className="text-sm text-gray-700">Evento activo</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
              <FaSave /> {event ? 'Actualizar' : 'Crear'} Evento
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default EventListComplete