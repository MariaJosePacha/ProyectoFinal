// src/middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
    console.error(err.stack || err); 
  
    // Manejo de errores personalizados
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        message: err.message || "Error desconocido",
        errorType: err.type || 'general',  
      });
    }
  
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: "Error de validación de datos",
        errors: err.errors, 
      });
    }
  
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: "Token inválido o mal formado",
      });
    }
  
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: "Token expirado",
      });
    }
  
    res.status(500).json({
      message: "Error en el servidor. Intenta nuevamente más tarde.",
    });
  };
  
  export default errorHandler;
  