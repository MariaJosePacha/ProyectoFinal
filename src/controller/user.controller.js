import UserService from "../services/user.service.js";
import UserDTO from "../dto/user.dto.js"; // Importamos el DTO
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendVerificationEmail } from "../config/nodemailer.js";

dotenv.config();

// Registro de usuario
export const registerUser = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await UserService.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already registered" });
    }

    // Crear usuario
    const newUser = await UserService.register({ email, password, name, verified: false });

    // Generar código de verificación
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    await sendVerificationEmail(email, verificationCode);

    // Guardamos el código de verificación
    newUser.verificationCode = verificationCode;
    await newUser.save();

    const userDTO = new UserDTO(newUser); // Convertimos el usuario a DTO

    res.status(201).json({ message: "User registered successfully. Please verify your email.", user: userDTO });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Inicio de sesión
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserService.getUserByEmail(email);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.verified) {
      return res.status(400).json({ message: "User email not verified" });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    const userDTO = new UserDTO(user); // Convertimos a DTO para enviar solo datos necesarios

    res.json({ message: "Login successful", user: userDTO, token });
  } catch (error) {
    res.status(500).json({ message: "Login error", error });
  }
};
