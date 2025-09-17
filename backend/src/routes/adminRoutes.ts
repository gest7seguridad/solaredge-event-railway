import { Router } from 'express';
import { verifyToken, isAdmin, AuthRequest } from '../middleware/auth';
import { db } from '../config/database';
import { Parser } from 'json2csv';

const router = Router();

router.use(verifyToken);
router.use(isAdmin);

router.get('/registrations', async (req: AuthRequest, res, next) => {
  try {
    const { eventId, status, search } = req.query;
    
    let query = db('registrations')
      .leftJoin('events', 'registrations.event_id', 'events.id')
      .select(
        'registrations.*',
        'events.title as event_title',
        'events.event_date'
      );

    if (eventId) {
      query = query.where('registrations.event_id', eventId);
    }

    if (status) {
      query = query.where('registrations.status', status);
    }

    if (search) {
      query = query.where(function() {
        this.where('registrations.first_name', 'ilike', `%${search}%`)
          .orWhere('registrations.last_name', 'ilike', `%${search}%`)
          .orWhere('registrations.email', 'ilike', `%${search}%`)
          .orWhere('registrations.company', 'ilike', `%${search}%`)
          .orWhere('registrations.confirmation_code', 'ilike', `%${search}%`);
      });
    }

    const registrations = await query.orderBy('registrations.created_at', 'desc');

    res.json({
      success: true,
      registrations
    });
  } catch (error) {
    next(error);
  }
});

router.get('/registrations/export', async (req: AuthRequest, res, next) => {
  try {
    const { eventId, format = 'csv' } = req.query;

    let query = db('registrations')
      .leftJoin('events', 'registrations.event_id', 'events.id')
      .select(
        'registrations.first_name',
        'registrations.last_name',
        'registrations.email',
        'registrations.phone',
        'registrations.company',
        'registrations.position',
        'registrations.nif_cif',
        'registrations.status',
        'registrations.confirmation_code',
        'registrations.created_at',
        'registrations.checked_in_at',
        'events.title as event_title'
      );

    if (eventId) {
      query = query.where('registrations.event_id', eventId);
    }

    const registrations = await query.orderBy('registrations.created_at', 'desc');

    if (format === 'csv') {
      const fields = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'company',
        'position',
        'nif_cif',
        'status',
        'confirmation_code',
        'created_at',
        'checked_in_at',
        'event_title'
      ];

      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(registrations);

      res.header('Content-Type', 'text/csv');
      res.attachment('registrations.csv');
      res.send(csv);
    } else {
      res.json({
        success: true,
        registrations
      });
    }
  } catch (error) {
    next(error);
  }
});

router.get('/dashboard/stats', async (req: AuthRequest, res, next) => {
  try {
    const { eventId } = req.query;
    
    let baseQuery = db('registrations');
    
    if (eventId) {
      baseQuery = baseQuery.where('event_id', eventId);
    }

    const stats = await baseQuery
      .select(
        db.raw('COUNT(*) FILTER (WHERE status = \'confirmed\') as confirmed'),
        db.raw('COUNT(*) FILTER (WHERE status = \'waitlist\') as waitlist'),
        db.raw('COUNT(*) FILTER (WHERE status = \'cancelled\') as cancelled'),
        db.raw('COUNT(*) FILTER (WHERE status = \'attended\') as attended'),
        db.raw('COUNT(*) as total')
      )
      .first();

    const recentRegistrations = await db('registrations')
      .select('id', 'first_name', 'last_name', 'company', 'created_at', 'status')
      .orderBy('created_at', 'desc')
      .limit(10);

    const companiesStats = await db('registrations')
      .select('company')
      .count('id as count')
      .groupBy('company')
      .orderBy('count', 'desc')
      .limit(10);

    const dailyRegistrations = await db('registrations')
      .select(db.raw('DATE(created_at) as date'))
      .count('id as count')
      .where('created_at', '>', db.raw('CURRENT_DATE - INTERVAL \'7 days\''))
      .groupBy(db.raw('DATE(created_at)'))
      .orderBy('date', 'asc');

    res.json({
      success: true,
      stats,
      recentRegistrations,
      companiesStats,
      dailyRegistrations
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/registrations/:id/status', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['confirmed', 'waitlist', 'cancelled', 'attended'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido'
      });
    }

    const [updated] = await db('registrations')
      .where({ id })
      .update({ status, updated_at: new Date() })
      .returning('*');

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Inscripción no encontrada'
      });
    }

    res.json({
      success: true,
      registration: updated
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/registrations/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await db('registrations')
      .where({ id })
      .delete();

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Inscripción no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Inscripción eliminada correctamente'
    });
  } catch (error) {
    next(error);
  }
});

export default router;