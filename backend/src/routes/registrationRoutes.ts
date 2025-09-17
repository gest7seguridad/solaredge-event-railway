import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../config/database';
import { sendConfirmationEmail } from '../utils/emailService';
import crypto from 'crypto';

const router = Router();

const generateConfirmationCode = (): string => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

router.post('/register',
  [
    body('firstName').trim().notEmpty().withMessage('El nombre es obligatorio'),
    body('lastName').trim().notEmpty().withMessage('Los apellidos son obligatorios'),
    body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
    body('phone').trim().notEmpty().withMessage('El teléfono es obligatorio'),
    body('company').trim().notEmpty().withMessage('La empresa es obligatoria'),
    body('eventId').isUUID().withMessage('ID de evento inválido')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { firstName, lastName, email, phone, company, position, nifCif, eventId } = req.body;

      const event = await db('events')
        .where({ id: eventId, is_active: true })
        .first();

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado o no activo'
        });
      }

      const existingRegistration = await db('registrations')
        .where({ event_id: eventId, email })
        .first();

      if (existingRegistration) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una inscripción con este email para este evento'
        });
      }

      const confirmedCount = await db('registrations')
        .where({ event_id: eventId, status: 'confirmed' })
        .count('id as count')
        .first();

      const currentCount = typeof confirmedCount?.count === 'number' 
        ? confirmedCount.count 
        : parseInt(confirmedCount?.count || '0');
      const status = currentCount >= event.max_attendees ? 'waitlist' : 'confirmed';
      const confirmationCode = generateConfirmationCode();

      const [registration] = await db('registrations')
        .insert({
          event_id: eventId,
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          company,
          position,
          nif_cif: nifCif,
          status,
          confirmation_code: confirmationCode,
          confirmed_at: new Date()
        })
        .returning('*');

      if (status === 'confirmed') {
        try {
          await sendConfirmationEmail({
            firstName,
            lastName,
            email,
            company,
            confirmationCode,
            eventTitle: event.title,
            eventDate: event.event_date,
            venueName: event.venue_name,
            venueAddress: event.venue_address,
            agenda: JSON.parse(event.agenda || '[]')
          });

          await db('registrations')
            .where({ id: registration.id })
            .update({ email_sent: true });
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
        }
      }

      res.status(201).json({
        success: true,
        message: status === 'confirmed' 
          ? 'Inscripción confirmada. Recibirá un email de confirmación en breve.'
          : 'Se ha añadido a la lista de espera. Le contactaremos si hay plazas disponibles.',
        registration: {
          id: registration.id,
          confirmationCode,
          status
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/verify/:code', async (req, res, next) => {
  try {
    const { code } = req.params;

    const registration = await db('registrations')
      .where({ confirmation_code: code })
      .first();

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Código de confirmación inválido'
      });
    }

    const event = await db('events')
      .where({ id: registration.event_id })
      .first();

    res.json({
      success: true,
      registration: {
        firstName: registration.first_name,
        lastName: registration.last_name,
        company: registration.company,
        status: registration.status,
        checkedIn: !!registration.checked_in_at
      },
      event: {
        title: event.title,
        date: event.event_date,
        venue: event.venue_name
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/check-in/:code', async (req, res, next) => {
  try {
    const { code } = req.params;

    const registration = await db('registrations')
      .where({ confirmation_code: code, status: 'confirmed' })
      .first();

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Inscripción no encontrada o no confirmada'
      });
    }

    if (registration.checked_in_at) {
      return res.status(400).json({
        success: false,
        message: 'Esta inscripción ya ha sido registrada'
      });
    }

    await db('registrations')
      .where({ id: registration.id })
      .update({ 
        checked_in_at: new Date(),
        status: 'attended'
      });

    res.json({
      success: true,
      message: 'Check-in realizado con éxito',
      attendee: {
        name: `${registration.first_name} ${registration.last_name}`,
        company: registration.company
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;