import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail', // Soporta Gmail o cualquier otro servicio
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io', // Fallback a Mailtrap si se configura
  port: process.env.EMAIL_PORT || 587,
  auth: {
    user: process.env.EMAIL_USER,   // Usuario del correo
    pass: process.env.EMAIL_PASS    // Contraseña o App Password
  }
});

// Función para enviar el correo de verificación
export const sendVerificationEmail = async (email, verificationToken) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;

  const mailOptions = {
    from: `"E-commerce App" <${process.env.EMAIL_USER}>`,
    to: email,
    replyTo: process.env.EMAIL_REPLY_TO || process.env.EMAIL_USER, // Permite responder al email
    subject: 'Verificación de Cuenta',
    html: `
      <h2>¡Gracias por registrarte!</h2>
      <p>Para verificar tu cuenta, haz clic en el siguiente enlace:</p>
      <a href="${verificationLink}" style="display:inline-block; padding:10px 20px; background-color:#007bff; color:#fff; text-decoration:none; border-radius:5px;">
        Verificar cuenta
      </a>
      <p>Si no te registraste, ignora este mensaje.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Correo de verificación enviado' };
  } catch (error) {
    console.error('❌ Error al enviar el correo:', error);
    return { success: false, message: 'Error al enviar el correo' };
  }
};
