import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/admin'
    }
    return Promise.reject(error)
  }
)

export const eventService = {
  getCurrentEvent: () => api.get('/events/current'),
  getEventById: (id: string) => api.get(`/events/${id}`),
  getAllEvents: () => api.get('/events'),
  createEvent: (data: any) => api.post('/events', data),
  updateEvent: (id: string, data: any) => api.put(`/events/${id}`, data),
  deleteEvent: (id: string) => api.delete(`/events/${id}`),
}

export const registrationService = {
  register: (data: any) => api.post('/registrations/register', data),
  verify: (code: string) => api.get(`/registrations/verify/${code}`),
  checkIn: (code: string) => api.post(`/registrations/check-in/${code}`),
}

export const authService = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
}

export const adminService = {
  getRegistrations: (params?: any) => 
    api.get('/admin/registrations', { params }),
  exportRegistrations: (eventId?: string) =>
    api.get('/admin/registrations/export', { 
      params: { eventId, format: 'csv' },
      responseType: 'blob'
    }),
  getDashboardStats: (eventId?: string) =>
    api.get('/admin/dashboard/stats', { params: { eventId } }),
  updateRegistrationStatus: (id: string, status: string) =>
    api.patch(`/admin/registrations/${id}/status`, { status }),
  deleteRegistration: (id: string) =>
    api.delete(`/admin/registrations/${id}`),
}

export default api