import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER,   
        pass: process.env.EMAIL_PASS,   
    },
});

export const sendVerificationEmail = async (email, verificationToken) => {
    const verificationLink = `http://localhost:8080/verify/${verificationToken}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verificación de Correo',
        html: `<p>Haz clic en el siguiente enlace para verificar tu correo electrónico:</p><a href="${verificationLink}">${verificationLink}</a>`,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error al enviar el correo:', error);
    }
};
