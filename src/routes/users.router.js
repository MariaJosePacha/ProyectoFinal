import { Router } from 'express';
import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import dotenv from 'dotenv';
import { sendVerificationEmail } from '../utils/mailer.js'; // Import the function to send the email
import verifyUser from '../middlewares/verifyUser.js'; // Import the verification middleware

dotenv.config();

const router = Router();
const SECRET_KEY = process.env.JWT_SECRET || 'JWTSecretKey'; // Now using environment variables

// User registration
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });

        // Create a verification token
        const verificationToken = jwt.sign({ email: newUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        newUser.verificationToken = verificationToken;

        await newUser.save();

        // Send the verification email
        await sendVerificationEmail(newUser.email, verificationToken);

        res.status(201).json({ message: 'User successfully registered. Please check your email for verification.' });
    } catch (error) {
        res.status(500).json({ message: 'Registration error', error });
    }
});

// Verify the user's email
router.get('/verify/:token', async (req, res) => {
    const { token } = req.params;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email: decoded.email });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User is already verified' });
        }

        user.isVerified = true;
        user.verificationToken = null; // Clear the verification token
        await user.save();

        res.status(200).json({ message: 'Email successfully verified' });
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired token' });
    }
});

// User login
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

        const token = jwt.sign({ sub: user._id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true }).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Login error', error });
    }
});

// Route to get the authenticated user's data with JWT
router.get('/current', passport.authenticate('jwt', { session: false }), verifyUser, (req, res) => {
    res.json({
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        photo: req.user.photo,
    });
});

export default router;
