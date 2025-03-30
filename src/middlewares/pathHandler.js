// src/middlewares/pathHandler.js

const pathHandler = (req, res) => {
    console.warn(`Ruta no encontrada: ${req.originalUrl}`);
  
    res.status(404).json({
      message: `Ruta no encontrada: ${req.originalUrl}`,
      statusCode: 404
    });
  };
  
  export default pathHandler;
  