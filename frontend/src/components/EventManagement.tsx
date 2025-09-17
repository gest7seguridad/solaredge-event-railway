import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { 
  FaPlus, FaEdit, FaTrash, FaCalendar, FaMapMarkerAlt, 
  FaUsers, FaTimes, FaSave, FaEye, FaEyeSlash 
} from 'react-icons/fa'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { eventService } from '../services/api'

interface Event {
  id?: string
  title: string
  description: string
  event_date: string
  registration_deadline: string
  venue_name: string
  venue_address: string
  venue_city: string
  venue_google_maps_url?: string
  max_attendees: number
  enable_waitlist: boolean
  agenda: any[]
  is_active: boolean
}

const EventManagement = () => {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  
  const { data, isLoading } = useQuery(
    'allEvents',
    async () => {
      const response = await eventService.getAllEvents()
      return response.data
    }
  )

  const createMutation = useMutation(
    (eventData: Event) => eventService.createEvent(eventData),
    {
      onSuccess: () => {
        toast.success('Evento creado correctamente')
        queryClient.invalidateQueries('allEvents')
        setShowForm(false)
      },
      onError: () => {
        toast.error('Error al crear el evento')
      }
    }
  )

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: Partial<Event> }) => 
      eventService.updateEvent(id, data),
    {
      onSuccess: () => {
        toast.success('Evento actualizado correctamente')
        queryClient.invalidateQueries('allEvents')
        setEditingEvent(null)
        setShowForm(false)
      },
      onError: () => {
        toast.error('Error al actualizar el evento')
      }
    }
  )

  const deleteMutation = useMutation(
    (id: string) => eventService.deleteEvent(id),
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

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este evento?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleToggleActive = (event: Event) => {
    updateMutation.mutate({
      id: event.id!,
      data: { is_active: !event.is_active }
    })
  }

  if (isLoading) {
    return <div className="text-center py-8">Cargando eventos...</div>
  }

  const events = data?.events || []

  return (
    <div>
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

      <div className="grid gap-4">
        {events.map((event: any) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <div className="flex justify-between items-start">
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {event.title}
                  </h3>
                  {event.is_active ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      Activo
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      Inactivo
                    </span>
                  )}
                </div>
                
                <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-2">
                    <FaCalendar className="text-gray-400" />
                    {format(new Date(event.event_date), "d 'de' MMMM 'de' yyyy", { locale: es })}
                  </div>
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-gray-400" />
                    {event.venue_city}
                  </div>
                  <div className="flex items-center gap-2">
                    <FaUsers className="text-gray-400" />
                    {event.stats?.confirmed_count || 0} / {event.max_attendees} inscritos
                  </div>
                </div>

                <p className="text-gray-600 text-sm line-clamp-2">
                  {event.description}
                </p>
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleToggleActive(event)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title={event.is_active ? 'Desactivar' : 'Activar'}
                >
                  {event.is_active ? <FaEyeSlash className="text-gray-600" /> : <FaEye className="text-green-600" />}
                </button>
                <button
                  onClick={() => {
                    setEditingEvent(event)
                    setShowForm(true)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Editar"
                >
                  <FaEdit className="text-blue-600" />
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <FaTrash className="text-red-600" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No hay eventos creados. Crea el primero haciendo clic en "Nuevo Evento".
        </div>
      )}

      {/* Formulario de Evento */}
      {showForm && (
        <EventForm
          event={editingEvent}
          onClose={() => {
            setShowForm(false)
            setEditingEvent(null)
          }}
          onSave={(eventData) => {
            if (editingEvent?.id) {
              updateMutation.mutate({ id: editingEvent.id, data: eventData })
            } else {
              createMutation.mutate(eventData)
            }
          }}
        />
      )}
    </div>
  )
}

const EventForm = ({ event, onClose, onSave }: any) => {
  const [formData, setFormData] = useState<Event>({
    title: event?.title || '',
    description: event?.description || '',
    event_date: event?.event_date ? format(new Date(event.event_date), "yyyy-MM-dd'T'HH:mm") : '',
    registration_deadline: event?.registration_deadline ? format(new Date(event.registration_deadline), "yyyy-MM-dd'T'HH:mm") : '',
    venue_name: event?.venue_name || '',
    venue_address: event?.venue_address || '',
    venue_city: event?.venue_city || '',
    venue_google_maps_url: event?.venue_google_maps_url || '',
    max_attendees: event?.max_attendees || 100,
    enable_waitlist: event?.enable_waitlist ?? true,
    agenda: event?.agenda || [
      { time: '15:00 - 15:30', title: 'Registro', description: '' }
    ],
    is_active: event?.is_active ?? true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const addAgendaItem = () => {
    setFormData({
      ...formData,
      agenda: [...formData.agenda, { time: '', title: '', description: '' }]
    })
  }

  const updateAgendaItem = (index: number, field: string, value: string) => {
    const newAgenda = [...formData.agenda]
    newAgenda[index] = { ...newAgenda[index], [field]: value }
    setFormData({ ...formData, agenda: newAgenda })
  }

  const removeAgendaItem = (index: number) => {
    setFormData({
      ...formData,
      agenda: formData.agenda.filter((_, i) => i !== index)
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
                Descripción *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha y Hora del Evento *
              </label>
              <input
                type="datetime-local"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Límite de Inscripción *
              </label>
              <input
                type="datetime-local"
                value={formData.registration_deadline}
                onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Lugar *
              </label>
              <input
                type="text"
                value={formData.venue_name}
                onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad *
              </label>
              <input
                type="text"
                value={formData.venue_city}
                onChange={(e) => setFormData({ ...formData, venue_city: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección *
              </label>
              <input
                type="text"
                value={formData.venue_address}
                onChange={(e) => setFormData({ ...formData, venue_address: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL de Google Maps
              </label>
              <input
                type="url"
                value={formData.venue_google_maps_url}
                onChange={(e) => setFormData({ ...formData, venue_google_maps_url: e.target.value })}
                className="input-field"
                placeholder="https://maps.google.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aforo Máximo *
              </label>
              <input
                type="number"
                value={formData.max_attendees}
                onChange={(e) => setFormData({ ...formData, max_attendees: parseInt(e.target.value) })}
                className="input-field"
                min="1"
                required
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Agenda del Evento</h3>
            <div className="space-y-3">
              {formData.agenda.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <input
                    type="text"
                    value={item.time}
                    onChange={(e) => updateAgendaItem(index, 'time', e.target.value)}
                    className="input-field flex-shrink-0 w-40"
                    placeholder="15:00 - 16:00"
                  />
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateAgendaItem(index, 'title', e.target.value)}
                    className="input-field flex-grow"
                    placeholder="Título de la actividad"
                  />
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateAgendaItem(index, 'description', e.target.value)}
                    className="input-field flex-grow"
                    placeholder="Descripción (opcional)"
                  />
                  <button
                    type="button"
                    onClick={() => removeAgendaItem(index)}
                    className="p-3 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addAgendaItem}
              className="mt-3 text-primary-600 hover:text-primary-700 flex items-center gap-2"
            >
              <FaPlus /> Añadir actividad
            </button>
          </div>

          <div className="flex items-center gap-6">
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

export default EventManagement