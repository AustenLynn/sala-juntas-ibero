const nodemailer = require('nodemailer');

const _enabled = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);

const transporter = _enabled
  ? nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  : null;

async function sendEmail(to, subject, html) {
  if (!_enabled) {
    console.log(`[Mailer] SMTP not configured — skipping email to ${to}: ${subject}`);
    return false;
  }
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    console.log(`[Mailer] Sent "${subject}" to ${to}`);
    return true;
  } catch (err) {
    console.error(`[Mailer] Failed to send "${subject}" to ${to}:`, err.message);
    return false;
  }
}

function reservationCreatedEmail(reservation) {
  const date  = new Date(reservation.start_time).toLocaleDateString('es-MX', { dateStyle: 'full' });
  const start = new Date(reservation.start_time).toISOString().substring(11, 16);
  const end   = new Date(reservation.end_time).toISOString().substring(11, 16);
  return {
    subject: `Reservación confirmada — Sala de Juntas Ibero`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;">
        <h2 style="color:#ef3e42;">Reservación confirmada</h2>
        <p>Se ha registrado una reservación de la Sala de Juntas con los siguientes datos:</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:6px 0;color:#555;">Responsable</td><td style="padding:6px 0;font-weight:600;">${reservation.responsible_name}</td></tr>
          <tr><td style="padding:6px 0;color:#555;">Área</td><td style="padding:6px 0;">${reservation.area}</td></tr>
          <tr><td style="padding:6px 0;color:#555;">Fecha</td><td style="padding:6px 0;">${date}</td></tr>
          <tr><td style="padding:6px 0;color:#555;">Horario</td><td style="padding:6px 0;">${start} – ${end}</td></tr>
          ${reservation.observations ? `<tr><td style="padding:6px 0;color:#555;">Observaciones</td><td style="padding:6px 0;">${reservation.observations}</td></tr>` : ''}
        </table>
        <hr style="margin:20px 0;border:none;border-top:1px solid #e0e0e0;" />
        <p style="font-size:12px;color:#888;">Universidad Iberoamericana — Sistema de Reservación de Sala de Juntas</p>
      </div>`,
  };
}

function reservationCancelledEmail(reservation) {
  const date  = new Date(reservation.start_time).toLocaleDateString('es-MX', { dateStyle: 'full' });
  const start = new Date(reservation.start_time).toISOString().substring(11, 16);
  const end   = new Date(reservation.end_time).toISOString().substring(11, 16);
  return {
    subject: `Reservación cancelada — Sala de Juntas Ibero`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;">
        <h2 style="color:#dc3545;">Reservación cancelada</h2>
        <p>La siguiente reservación ha sido cancelada:</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:6px 0;color:#555;">Responsable</td><td style="padding:6px 0;font-weight:600;">${reservation.responsible_name}</td></tr>
          <tr><td style="padding:6px 0;color:#555;">Área</td><td style="padding:6px 0;">${reservation.area}</td></tr>
          <tr><td style="padding:6px 0;color:#555;">Fecha</td><td style="padding:6px 0;">${date}</td></tr>
          <tr><td style="padding:6px 0;color:#555;">Horario</td><td style="padding:6px 0;">${start} – ${end}</td></tr>
        </table>
        <hr style="margin:20px 0;border:none;border-top:1px solid #e0e0e0;" />
        <p style="font-size:12px;color:#888;">Universidad Iberoamericana — Sistema de Reservación de Sala de Juntas</p>
      </div>`,
  };
}

function passwordResetEmail(resetLink) {
  return {
    subject: `Restablecer contraseña — Sala de Juntas Ibero`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;">
        <h2 style="color:#ef3e42;">Restablecer contraseña</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón para continuar:</p>
        <a href="${resetLink}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#ef3e42;color:white;text-decoration:none;border-radius:6px;font-weight:600;">
          Restablecer contraseña
        </a>
        <p style="font-size:13px;color:#555;">Este enlace expira en 1 hora. Si no solicitaste esto, ignora este correo.</p>
        <hr style="margin:20px 0;border:none;border-top:1px solid #e0e0e0;" />
        <p style="font-size:12px;color:#888;">Universidad Iberoamericana — Sistema de Reservación de Sala de Juntas</p>
      </div>`,
  };
}

module.exports = { sendEmail, reservationCreatedEmail, reservationCancelledEmail, passwordResetEmail };
