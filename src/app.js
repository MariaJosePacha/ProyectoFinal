import express from "express";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import path from "path"; 
import methodOverride from "method-override";
import productRouter from "./routes/products.router.js";
import cartRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js";
import usersRouter from "./routes/users.router.js"; // Importar las rutas de usuarios
import Product from "./models/product.model.js";
import Cart from "./models/cart.model.js";
import cookieParser from "cookie-parser";
import passport from "passport"; // Importar Passport
import dotenv from "dotenv";  // Importar dotenv
import "./database.js"; 
import "./config/passport.js"; // Importar la configuración de Passport
import errorHandler from "./middlewares/errorHandler.js"; // Importar el errorHandler
import pathHandler from "./middlewares/pathHandler.js"; // Importar el pathHandler
import morgan from "morgan";  // Importar morgan para registro de solicitudes HTTP
import "./seed.js"; // 🔥 Se ejecutará automáticamente al iniciar la aplicación

// Cargar las variables de entorno
dotenv.config();  // Importar y configurar dotenv para acceder a las variables del archivo .env

const app = express();
const PORT = 8080;

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve("src/public")));
app.use(methodOverride("_method"));
app.use(passport.initialize()); // Inicializar Passport

// Configuración de morgan para log de solicitudes HTTP
app.use(morgan("dev"));  // Aquí estamos configurando morgan para registrar todas las solicitudes HTTP

// Configuración de Express-Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.resolve("src/views"));

// Rutas
app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);
app.use("/api/users", usersRouter); // Usar las rutas de usuarios
app.use("/", viewsRouter);

// Middleware para rutas no encontradas
app.use(pathHandler);  // Esto maneja las rutas no encontradas (404)

// Middleware para manejar errores
app.use(errorHandler);  // Esto maneja los errores

// Servidor HTTP y WebSockets
const httpServer = app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});

const io = new Server(httpServer);

// WebSockets: Productos en tiempo real
io.on("connection", async (socket) => {
    console.log("Cliente conectado");

    // Enviar productos al cliente
    socket.emit("productos", await Product.find());

    // Agregar producto
    socket.on("agregarProducto", async (producto) => {
        try {
            const nuevoProducto = new Product(producto);
            await nuevoProducto.save();
            io.sockets.emit("productos", await Product.find());
        } catch (error) {
            console.error("Error al agregar producto:", error);
        }
    });

    // Eliminar producto
    socket.on("eliminarProducto", async (id) => {
        try {
            await Product.findByIdAndDelete(id);
            io.sockets.emit("productos", await Product.find());
        } catch (error) {
            console.error("Error al eliminar producto:", error);
        }
    });
});

// Manejar el cierre del servidor correctamente
process.on('SIGINT', () => {
    console.log('Cerrando servidor...');
    httpServer.close(() => {
        console.log('Servidor cerrado');
        mongoose.connection.close(() => {
            console.log('Conexión a la base de datos cerrada');
            process.exit(0); // Salir de forma limpia
        });
    });
});
