// src/middlewares/verifyUser.js
import User from '../models/user.model.js';

const verifyUser = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ message: "ID de usuario no encontrado en la solicitud" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Cuenta no verificada, no puedes iniciar sesión" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Error en el middleware verifyUser:", error);
    res.status(500).json({ message: "Error en el servidor. Intenta nuevamente más tarde." });
  }
};

export default verifyUser;
