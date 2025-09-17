import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  confirmationCode: string;
  eventTitle: string;
  eventDate: Date;
  venueName: string;
  venueAddress: string;
  agenda: any[];
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      ...options
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

export const generateQRCode = async (data: string): Promise<string> => {
  try {
    const qrCode = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCode;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

export const sendConfirmationEmail = async (data: RegistrationData): Promise<void> => {
  const qrCode = await generateQRCode(data.confirmationCode);
  const formattedDate = format(new Date(data.eventDate), "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
  const formattedTime = format(new Date(data.eventDate), "HH:mm");

  const agendaHtml = data.agenda.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <strong>${item.time}</strong>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        ${item.title}
      </td>
    </tr>
  `).join('');

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Roboto', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #709eb5 0%, #5a8299 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
        .qr-container { text-align: center; margin: 30px 0; padding: 20px; background: #f9fafb; border-radius: 8px; }
        .info-box { background: #f0f9ff; border-left: 4px solid #709eb5; padding: 15px; margin: 20px 0; }
        .agenda-table { width: 100%; margin: 20px 0; border-collapse: collapse; }
        .button { display: inline-block; padding: 12px 30px; background: #709eb5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding: 20px; color: #6b7280; font-size: 14px; }
        .logos { display: flex; justify-content: center; align-items: center; gap: 40px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">¡Inscripción Confirmada!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">${data.eventTitle}</p>
        </div>
        
        <div class="content">
          <p>Estimado/a <strong>${data.firstName} ${data.lastName}</strong>,</p>
          
          <p>Nos complace confirmar su inscripción al evento. A continuación encontrará todos los detalles:</p>
          
          <div class="info-box">
            <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${formattedDate}</p>
            <p style="margin: 5px 0;"><strong>🕐 Hora:</strong> ${formattedTime} h</p>
            <p style="margin: 5px 0;"><strong>📍 Lugar:</strong> ${data.venueName}</p>
            <p style="margin: 5px 0;"><strong>📌 Dirección:</strong> ${data.venueAddress}</p>
            <p style="margin: 5px 0;"><strong>🏢 Empresa:</strong> ${data.company}</p>
          </div>
          
          <h3 style="color: #709eb5;">Agenda del Evento</h3>
          <table class="agenda-table">
            ${agendaHtml}
          </table>
          
          <div class="qr-container">
            <h3 style="color: #709eb5;">Su Código QR de Acceso</h3>
            <img src="${qrCode}" alt="QR Code" style="max-width: 200px;">
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">
              Código: <strong>${data.confirmationCode}</strong>
            </p>
            <p style="margin: 5px 0; font-size: 13px; color: #6b7280;">
              Presente este código QR en la entrada del evento
            </p>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>🚗 Aparcamiento gratuito disponible</strong></p>
          </div>
          
          <p>Si tiene alguna pregunta, no dude en contactarnos.</p>
          
          <p>¡Le esperamos!</p>
          
          <div class="logos">
            <div style="text-align: center;">
              <p style="margin: 5px 0; color: #6b7280; font-size: 12px;">Organiza:</p>
              <strong style="color: #709eb5;">Solarland</strong>
            </div>
            <div style="text-align: center;">
              <p style="margin: 5px 0; color: #6b7280; font-size: 12px;">Colabora:</p>
              <strong style="color: #709eb5;">SolarEdge</strong>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p>Este es un correo automático, por favor no responda a este mensaje.</p>
          <p>© 2024 Solarland S.L. - Todos los derechos reservados</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: data.email,
    subject: `Confirmación de Inscripción - ${data.eventTitle}`,
    html: emailHtml
  });
};