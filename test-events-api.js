const axios = require('axios');
const jwt = require('jsonwebtoken');

async function testEventsAPI() {
  try {
    // Generar token
    const token = jwt.sign(
      { id: 1, email: 'admin@solarland.com', role: 'admin' },
      'SolarLand2025ProductionToken!@#$%^&*()_+SecureKey'
    );

    // Hacer petición
    const response = await axios.get('http://localhost:3000/api/events', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ API Response received');
    console.log('Total events:', response.data.length);

    response.data.forEach(event => {
      console.log('\n📋 Event ID:', event.id);
      console.log('   Title:', event.title);
      console.log('   Active:', event.is_active);
      console.log('   Agenda type:', typeof event.agenda);
      console.log('   Agenda value:', event.agenda);
      console.log('   Tags type:', typeof event.tags);
      console.log('   Tags value:', event.tags);
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testEventsAPI();