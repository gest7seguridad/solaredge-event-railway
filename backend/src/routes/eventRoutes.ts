import { Router } from 'express';
import { db } from '../config/database';
import { verifyToken, isAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/current', async (req, res, next) => {
  try {
    const event = await db('events')
      .where({ is_active: true })
      .where('event_date', '>', new Date())
      .orderBy('event_date', 'asc')
      .first();

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'No hay eventos activos disponibles'
      });
    }

    const registrationCount = await db('registrations')
      .where({ event_id: event.id, status: 'confirmed' })
      .count('id as count')
      .first();

    const count = registrationCount?.count;
    const availableSpots = event.max_attendees - (typeof count === 'number' ? count : parseInt(count || '0'));
    
    res.json({
      success: true,
      event: {
        ...event,
        available_spots: availableSpots,
        registration_count: registrationCount?.count || 0
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', verifyToken, async (req: AuthRequest, res, next) => {
  try {
    const events = await db('events')
      .orderBy('event_date', 'desc')
      .select();

    const eventsWithStats = await Promise.all(
      events.map(async (event) => {
        const stats = await db('registrations')
          .where({ event_id: event.id })
          .select(
            db.raw('COUNT(*) FILTER (WHERE status = \'confirmed\') as confirmed_count'),
            db.raw('COUNT(*) FILTER (WHERE status = \'waitlist\') as waitlist_count'),
            db.raw('COUNT(*) FILTER (WHERE status = \'attended\') as attended_count')
          )
          .first();

        return {
          ...event,
          stats
        };
      })
    );

    res.json({
      success: true,
      events: eventsWithStats
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const event = await db('events')
      .where({ id })
      .first();

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    const registrationCount = await db('registrations')
      .where({ event_id: event.id, status: 'confirmed' })
      .count('id as count')
      .first();

    const count = registrationCount?.count;
    const availableSpots = event.max_attendees - (typeof count === 'number' ? count : parseInt(count || '0'));

    res.json({
      success: true,
      event: {
        ...event,
        available_spots: availableSpots,
        registration_count: registrationCount?.count || 0
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', verifyToken, isAdmin, async (req: AuthRequest, res, next) => {
  try {
    const eventData = req.body;
    
    // Asegurar que agenda sea un JSON string
    if (typeof eventData.agenda !== 'string') {
      eventData.agenda = JSON.stringify(eventData.agenda);
    }

    const [newEvent] = await db('events')
      .insert({
        ...eventData,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');

    res.status(201).json({
      success: true,
      event: newEvent
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', verifyToken, isAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Asegurar que agenda sea un JSON string si se proporciona
    if (updateData.agenda && typeof updateData.agenda !== 'string') {
      updateData.agenda = JSON.stringify(updateData.agenda);
    }

    const updated = await db('events')
      .where({ id })
      .update({
        ...updateData,
        updated_at: new Date()
      })
      .returning('*');

    if (!updated.length) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    res.json({
      success: true,
      event: updated[0]
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', verifyToken, isAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await db('events')
      .where({ id })
      .delete();

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Evento eliminado correctamente'
    });
  } catch (error) {
    next(error);
  }
});

export default router;