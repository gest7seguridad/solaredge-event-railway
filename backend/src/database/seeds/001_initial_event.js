exports.seed = async function(knex) {
  await knex('events').del();
  
  await knex('events').insert([
    {
      title: 'Curso Presencial SolarEdge - Optimización Real',
      description: `Nos complace invitarle al curso presencial, organizado junto con nuestro fabricante SolarEdge, que tendrá lugar el próximo 2 de octubre en nuestras instalaciones en Fuerteventura.

Durante el evento, se presentará la colaboración estratégica entre SolarEdge y Solarland, se explicará en detalle la solución SolarEdge, poniendo especial énfasis en cómo la optimización real marca la diferencia. Además, se realizarán demostraciones prácticas de nuestros softwares, seguidas de una sesión de preguntas y respuestas para resolver todas sus dudas.`,
      event_date: new Date('2024-10-02 15:00:00'),
      registration_deadline: new Date('2024-09-30 23:59:59'),
      venue_name: 'Solarland S.L.',
      venue_address: 'C/ La Vista, 6. Villaverde, La Oliva',
      venue_city: 'Fuerteventura',
      venue_google_maps_url: 'https://maps.google.com/?q=Solarland+SL+Fuerteventura',
      max_attendees: 100,
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
      ]),
      organizer_name: 'Solarland',
      organizer_logo_url: '/logos/solarland-logo.png',
      collaborator_name: 'SolarEdge',
      collaborator_logo_url: '/logos/solaredge-logo.png',
      is_active: true
    }
  ]);
};