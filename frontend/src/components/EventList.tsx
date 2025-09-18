import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import {
  FaPlus, FaEdit, FaTrash, FaCalendar, FaMapMarkerAlt,
  FaUsers, FaTimes, FaSave, FaEye, FaEyeSlash
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
}

const EventList = () => {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  const { data: events = [], isLoading } = useQuery(
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
        setEditingEvent(null)
      },
      onError: () => {
        toast.error('Error al crear el evento')
      }
    }
  )

  const updateMutation = useMutation(
    ({ id, data }: { id: number; data: Event }) =>
      eventService.updateEvent(id.toString(), data),
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
    setEditingEvent(event)
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
                        {new Date(event.date).toLocaleDateString('es-ES')}
                        {event.time && ` - ${event.time}`}
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
                        Capacidad: {event.capacity}
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
        <EventForm
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

const EventForm = ({ event, onClose, onSave }: {
  event: Event | null
  onClose: () => void
  onSave: (data: Event) => void
}) => {
  const [formData, setFormData] = useState<Event>({
    title: event?.title || '',
    description: event?.description || '',
    date: event?.date || new Date().toISOString().split('T')[0],
    time: event?.time || '10:00',
    location: event?.location || '',
    capacity: event?.capacity || 100,
    image_url: event?.image_url || '',
    is_active: event?.is_active !== undefined ? event.is_active : true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl max-w-2xl w-full"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">
              {event ? 'Editar Evento' : 'Nuevo Evento'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <FaTimes className="text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título del Evento *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacidad
            </label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Evento activo</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
              <FaSave /> {event ? 'Actualizar' : 'Crear'} Evento
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default EventList