import { Router } from 'express';
import { verifyToken, isAdmin, AuthRequest } from '../middleware/auth';
import { sendEmail } from '../utils/emailService';
import fs from 'fs';
import path from 'path';

const router = Router();

// Usar middleware de autenticación para todas las rutas
router.use(verifyToken);
router.use(isAdmin);

// Obtener configuración SMTP actual
router.get('/smtp', async (req: AuthRequest, res, next) => {
  try {
    // Por seguridad, no enviamos la contraseña real
    const config = {
      SMTP_HOST: process.env.SMTP_HOST || '',
      SMTP_PORT: process.env.SMTP_PORT || '587',
      SMTP_SECURE: process.env.SMTP_SECURE === 'true',
      SMTP_USER: process.env.SMTP_USER || '',
      EMAIL_FROM: process.env.EMAIL_FROM || '',
      // Indicamos si hay contraseña configurada sin enviarla
      SMTP_PASS_CONFIGURED: !!process.env.SMTP_PASS
    };

    res.json({
      success: true,
      config
    });
  } catch (error) {
    next(error);
  }
});

// Actualizar configuración SMTP
router.put('/smtp', async (req: AuthRequest, res, next) => {
  try {
    const { 
      SMTP_HOST, 
      SMTP_PORT, 
      SMTP_SECURE, 
      SMTP_USER, 
      SMTP_PASS, 
      EMAIL_FROM 
    } = req.body;

    // Actualizar variables de entorno en memoria
    if (SMTP_HOST !== undefined) process.env.SMTP_HOST = SMTP_HOST;
    if (SMTP_PORT !== undefined) process.env.SMTP_PORT = SMTP_PORT;
    if (SMTP_SECURE !== undefined) process.env.SMTP_SECURE = String(SMTP_SECURE);
    if (SMTP_USER !== undefined) process.env.SMTP_USER = SMTP_USER;
    if (SMTP_PASS !== undefined && SMTP_PASS !== '') process.env.SMTP_PASS = SMTP_PASS;
    if (EMAIL_FROM !== undefined) process.env.EMAIL_FROM = EMAIL_FROM;

    // Actualizar archivo .env
    const envPath = path.join(__dirname, '../../.env');
    let envContent = '';
    
    try {
      envContent = fs.readFileSync(envPath, 'utf8');
    } catch (err) {
      // Si no existe, creamos contenido básico
      envContent = '';
    }

    // Función para actualizar o agregar variable en el .env
    const updateEnvVariable = (content: string, key: string, value: string): string => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(content)) {
        return content.replace(regex, `${key}=${value}`);
      } else {
        return content + (content.endsWith('\n') ? '' : '\n') + `${key}=${value}`;
      }
    };

    if (SMTP_HOST !== undefined) {
      envContent = updateEnvVariable(envContent, 'SMTP_HOST', SMTP_HOST);
    }
    if (SMTP_PORT !== undefined) {
      envContent = updateEnvVariable(envContent, 'SMTP_PORT', SMTP_PORT);
    }
    if (SMTP_SECURE !== undefined) {
      envContent = updateEnvVariable(envContent, 'SMTP_SECURE', String(SMTP_SECURE));
    }
    if (SMTP_USER !== undefined) {
      envContent = updateEnvVariable(envContent, 'SMTP_USER', SMTP_USER);
    }
    if (SMTP_PASS !== undefined && SMTP_PASS !== '') {
      envContent = updateEnvVariable(envContent, 'SMTP_PASS', SMTP_PASS);
    }
    if (EMAIL_FROM !== undefined) {
      envContent = updateEnvVariable(envContent, 'EMAIL_FROM', EMAIL_FROM);
    }

    fs.writeFileSync(envPath, envContent);

    res.json({
      success: true,
      message: 'Configuración SMTP actualizada correctamente'
    });
  } catch (error) {
    next(error);
  }
});

// Probar configuración SMTP
router.post('/smtp/test', async (req: AuthRequest, res, next) => {
  try {
    const { testEmail } = req.body;

    if (!testEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email de prueba requerido'
      });
    }

    // Enviar email de prueba
    await sendEmail({
      to: testEmail,
      subject: 'Prueba de configuración SMTP - SolarEdge Event',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #709eb5;">¡Configuración SMTP Exitosa!</h2>
          <p>Este es un email de prueba desde el sistema de inscripción de eventos SolarEdge.</p>
          <p>Si estás recibiendo este mensaje, significa que la configuración SMTP está funcionando correctamente.</p>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
          <h3>Detalles de configuración:</h3>
          <ul>
            <li><strong>Host:</strong> ${process.env.SMTP_HOST}</li>
            <li><strong>Puerto:</strong> ${process.env.SMTP_PORT}</li>
            <li><strong>Usuario:</strong> ${process.env.SMTP_USER}</li>
            <li><strong>Desde:</strong> ${process.env.EMAIL_FROM}</li>
          </ul>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            Sistema de Inscripción de Eventos - SolarEdge & Solarland
          </p>
        </body>
        </html>
      `
    });

    res.json({
      success: true,
      message: `Email de prueba enviado correctamente a ${testEmail}`
    });
  } catch (error) {
    console.error('Error enviando email de prueba:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar email de prueba. Verifica la configuración SMTP.',
      error: error.message
    });
  }
});

// Obtener servicios SMTP predefinidos
router.get('/smtp/services', async (req: AuthRequest, res, next) => {
  try {
    const services = [
      {
        name: 'Gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        note: 'Requiere contraseña de aplicación. Activa verificación en 2 pasos.'
      },
      {
        name: 'Outlook/Hotmail',
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        note: 'Usa tu email y contraseña de Outlook/Hotmail'
      },
      {
        name: 'Yahoo',
        host: 'smtp.mail.yahoo.com',
        port: 587,
        secure: false,
        note: 'Requiere contraseña de aplicación'
      },
      {
        name: 'SendGrid',
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        note: 'Usuario: apikey, Contraseña: tu API key de SendGrid'
      },
      {
        name: 'Mailgun',
        host: 'smtp.mailgun.org',
        port: 587,
        secure: false,
        note: 'Usa las credenciales SMTP de tu dominio en Mailgun'
      },
      {
        name: 'Amazon SES',
        host: 'email-smtp.[region].amazonaws.com',
        port: 587,
        secure: false,
        note: 'Reemplaza [region] con tu región AWS'
      },
      {
        name: 'Ethereal (Pruebas)',
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        note: 'Servicio gratuito para pruebas. Los emails no se envían realmente.'
      },
      {
        name: 'Personalizado',
        host: '',
        port: 587,
        secure: false,
        note: 'Configura manualmente tu servidor SMTP'
      }
    ];

    res.json({
      success: true,
      services
    });
  } catch (error) {
    next(error);
  }
});

export default router;