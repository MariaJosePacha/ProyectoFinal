import { Router } from 'express';
import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { sendVerificationEmail } from '../config/nodemailer.js';  
import passport from 'passport';  
import verifyUser from '../middlewares/verifyUser.js'; 

dotenv.config();

const router = Router();
const SECRET_KEY = process.env.JWT_SECRET || 'JWTSecretKey'; // Usando variables de entorno

// Registro de usuario
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Verificar si el correo, la contraseña y el nombre están presentes
        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Email, password, and name are required' });
        }

        // Verificar si el usuario ya existe
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword, name, isVerified: false });

        // Crear el código de verificación
        const verificationCode = Math.floor(100000 + Math.random() * 900000); // Código de 6 dígitos

        // Enviar el correo de verificación
        await sendVerificationEmail(newUser.email, verificationCode);

        // Guardar el código de verificación en la base de datos
        newUser.verificationCode = verificationCode;
        await newUser.save();

        res.status(201).json({ message: 'User successfully registered. Please check your email for verification.' });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: 'Registration error', error });
    }
});

// Verificar el correo del usuario
router.get('/verify/:token', async (req, res) => {
    const { token } = req.params;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email: decoded.email });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        if (user.isVerified) { // Cambié verified por isVerified
            return res.status(400).json({ message: 'User already verified' });
        }

        user.isVerified = true; // Cambié verified por isVerified
        user.verificationCode = null; // Limpiar el código de verificación
        await user.save();

        res.status(200).json({ message: 'Email successfully verified' });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'Token expired' });
        }
        console.error("Verification error:", error);
        res.status(400).json({ message: 'Invalid or expired token' });
    }
});

// Inicio de sesión del usuario
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect password' });
        }

        // Verificar si el usuario está verificado
        if (!user.isVerified) { // Cambié verified por isVerified
            return res.status(401).json({ message: 'User email not verified' }); // Usé 401 en lugar de 400
        }

        const token = jwt.sign({ sub: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: 'Login error', error });
    }
});

// Obtener los datos del usuario autenticado con JWT
router.get('/current', passport.authenticate('jwt', { session: false }), verifyUser, (req, res) => {
    res.json({
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        photo: req.user.photo,
    });
});

export default router;
