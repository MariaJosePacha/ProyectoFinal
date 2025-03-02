import express from "express";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import path from "path"; 
import methodOverride from "method-override";
import productRouter from "./routes/products.router.js";
import cartRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js";
import usersRouter from "./routes/users.router.js"; // ✅ Importar users.router.js
import Product from "./models/product.model.js";
import Cart from "./models/cart.model.js";
import cookieParser from "cookie-parser";
import passport from "passport"; // ✅ Importar Passport
import "./database.js"; 
import "./config/passport.js"; // ✅ Importar configuración de Passport

const app = express();
const PORT = 8080;

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve("src/public")));
app.use(methodOverride("_method"));
app.use(passport.initialize()); // ✅ Habilitar Passport

// Configuración de Express-Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.resolve("src/views"));

// Rutas
app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);
app.use("/api/users", usersRouter); // ✅ Agregar rutas de usuarios
app.use("/", viewsRouter);

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
