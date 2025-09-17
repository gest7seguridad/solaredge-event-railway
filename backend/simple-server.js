const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock event data
const mockEvent = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Curso Presencial SolarEdge - Optimización Real',
  description: `Nos complace invitarle al curso presencial, organizado junto con nuestro fabricante SolarEdge, que tendrá lugar el próximo 2 de octubre en nuestras instalaciones en Fuerteventura.

Durante el evento, se presentará la colaboración estratégica entre SolarEdge y Solarland, se explicará en detalle la solución SolarEdge, poniendo especial énfasis en cómo la optimización real marca la diferencia. Además, se realizarán demostraciones prácticas de nuestros softwares, seguidas de una sesión de preguntas y respuestas para resolver todas sus dudas.`,
  event_date: '2024-10-02T15:00:00',
  registration_deadline: '2024-09-30T23:59:59',
  venue_name: 'Solarland S.L.',
  venue_address: 'C/ La Vista, 6. Villaverde, La Oliva',
  venue_city: 'Fuerteventura',
  venue_google_maps_url: 'https://maps.google.com/?q=Solarland+SL+Fuerteventura',
  max_attendees: 100,
  available_spots: 65,
  registration_count: 35,
  enable_waitlist: true,
  agenda: JSON.stringify([
    {
      time: '15:00 - 15:30',
      title: 'Registro de asistentes y café de bienvenida',
      description: 'Recepción y acreditación de participantes'
    },
    {
      time: '15:30 - 17:30',
      title: 'El valor añadido de la solución optimizada SolarEdge',
      description: 'Presentación técnica y casos de éxito'
    },
    {
      time: '17:30 - 18:00',
      title: 'Pausa',
      description: 'Networking y refrigerio'
    },
    {
      time: '18:00 - 20:00',
      title: 'Demostraciones prácticas',
      description: 'Sesión práctica y preguntas y respuestas'
    },
    {
      time: '20:00 - 20:30',
      title: 'Cóctel y networking',
      description: 'Cierre del evento con networking'
    }
  ])
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.get('/api/events/current', (req, res) => {
  res.json({
    success: true,
    event: mockEvent
  });
});

app.post('/api/registrations/register', (req, res) => {
  const confirmationCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  res.json({
    success: true,
    message: 'Inscripción confirmada. Recibirá un email de confirmación en breve.',
    registration: {
      id: Math.random().toString(36),
      confirmationCode,
      status: 'confirmed'
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@solarland.com' && password === 'admin123456') {
    res.json({
      success: true,
      token: 'mock-jwt-token',
      user: {
        id: '1',
        email: 'admin@solarland.com',
        name: 'Administrador',
        role: 'admin'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Credenciales inválidas'
    });
  }
});

app.get('/api/admin/dashboard/stats', (req, res) => {
  res.json({
    success: true,
    stats: {
      total: 35,
      confirmed: 30,
      waitlist: 3,
      attended: 0,
      cancelled: 2
    },
    dailyRegistrations: [
      { date: '2024-09-10', count: 5 },
      { date: '2024-09-11', count: 8 },
      { date: '2024-09-12', count: 12 },
      { date: '2024-09-13', count: 6 },
      { date: '2024-09-14', count: 4 }
    ],
    companiesStats: [
      { company: 'Electricidad Solar SL', count: 5 },
      { company: 'Energías Renovables Canarias', count: 4 },
      { company: 'Instalaciones Técnicas FV', count: 3 },
      { company: 'Solar Power Solutions', count: 3 },
      { company: 'Green Energy Corp', count: 2 }
    ],
    recentRegistrations: [
      { id: '1', first_name: 'Juan', last_name: 'Pérez', company: 'Solar Tech', status: 'confirmed', created_at: new Date() },
      { id: '2', first_name: 'María', last_name: 'González', company: 'Green Energy', status: 'confirmed', created_at: new Date() }
    ]
  });
});

app.get('/api/admin/registrations', (req, res) => {
  res.json({
    success: true,
    registrations: [
      {
        id: '1',
        first_name: 'Juan',
        last_name: 'Pérez',
        email: 'juan@example.com',
        phone: '600123456',
        company: 'Solar Tech SL',
        position: 'Técnico',
        status: 'confirmed',
        confirmation_code: 'ABC12345',
        created_at: new Date()
      },
      {
        id: '2',
        first_name: 'María',
        last_name: 'González',
        email: 'maria@example.com',
        phone: '600654321',
        company: 'Green Energy',
        position: 'Ingeniera',
        status: 'confirmed',
        confirmation_code: 'DEF67890',
        created_at: new Date()
      }
    ]
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Simple mock server running on http://localhost:${PORT}`);
});