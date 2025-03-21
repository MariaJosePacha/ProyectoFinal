import passport from 'passport';

const authenticate = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'Error en la autenticación', error: err.message });
    }
    if (!user) {
      return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    req.user = user; 
    next(); 
  })(req, res, next);
};

// Middleware para verificar si el usuario es administrador
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado. Requiere permisos de administrador.' });
  }
  next(); 
};

export { authenticate, authorizeAdmin };
