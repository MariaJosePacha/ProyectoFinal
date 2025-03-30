import { Router } from "express";
import ProductModel from "../models/product.model.js";
import CartModel from "../models/cart.model.js";
import UserModel from "../models/user.model.js"; 
import jwt from "jsonwebtoken";

const router = Router();

// Ruta para ver todos los productos con paginación
router.get("/products", async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    try {
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            lean: true 
        };

        const result = await ProductModel.paginate({}, options);

        res.render("home", {
            productos: result.docs,
            page: result.page,
            totalPages: result.totalPages,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            limit
        });
    } catch (error) {
        console.error("Error al obtener productos con paginación:", error);
        res.status(500).send("Error al obtener los productos");
    }
});

// Ruta para ver los detalles de un carrito específico
router.get("/carts/:cid", async (req, res) => {
    const cartId = req.params.cid;

    try {
        const cart = await CartModel.findById(cartId).populate("products.product").lean();

        if (!cart) {
            return res.status(404).send("Carrito no encontrado");
        }

        // Calcular el total del carrito
        const totalPrice = cart.products.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);

        res.render("cart", { cart, totalPrice });
    } catch (error) {
        console.error("Error al obtener el carrito:", error);
        res.status(500).send("Error al obtener el carrito");
    }
});

// Ruta para ver el carrito del usuario autenticado
router.get("/carts", async (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect("/users/login");
    }

    try {
        const decoded = jwt.verify(token, "secretkey");
        const cart = await CartModel.findOne({ userId: decoded.userId }).populate("products.product").lean();

        if (!cart) {
            return res.render("cart", { cart: null });
        }

        // Calcular el total del carrito
        const totalPrice = cart.products.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);

        res.render("cart", { cart, totalPrice });
    } catch (error) {
        console.error("Error al obtener el carrito:", error);
        res.status(500).send("Error al obtener el carrito");
    }
});

// Ruta para manejar el registro de usuario
router.post("/users/register", async (req, res) => {
    const { username, password } = req.body;

    // Verificar que ambos campos sean proporcionados
    if (!username || !password) {
        return res.status(400).send("El nombre de usuario y la contraseña son obligatorios");
    }

    try {
        // Verificar si el usuario ya existe
        const existingUser = await UserModel.findOne({ username });
        if (existingUser) {
            return res.status(400).send("El nombre de usuario ya está en uso");
        }

        // Crear un nuevo usuario
        const user = new UserModel({ username, password });
        await user.save();

        // Redirigir al login después de crear el usuario
        res.redirect("/users/login");
    } catch (error) {
        console.error("Error al registrar el usuario:", error);
        res.status(500).send("Error al registrar el usuario");
    }
});

// Ruta para ver formulario de registro
router.get("/users/register", (req, res) => {
    res.render("register");
});

// Ruta para ver formulario de login
router.get("/users/login", (req, res) => {
    res.render("login");
});

// Ruta para manejar login de usuario
router.post("/users/login", async (req, res) => {
    const { username, password } = req.body;

    // Validación básica para login
    if (!username || !password) {
        return res.status(400).send("El nombre de usuario y la contraseña son obligatorios");
    }

    try {
        const user = await UserModel.findOne({ username, password });

        if (!user) {
            return res.status(400).send("Credenciales inválidas");
        }

        const token = jwt.sign({ userId: user._id }, "secretkey", { expiresIn: "1h" });

        res.cookie("token", token); // Guardar el token en una cookie
        res.redirect("/profile");
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        res.status(500).send("Error al iniciar sesión");
    }
});

// Ruta para ver el perfil del usuario
router.get("/profile", async (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect("/users/login");
    }

    try {
        const decoded = jwt.verify(token, "secretkey");
        const user = await UserModel.findById(decoded.userId);

        res.render("profile", { user });
    } catch (error) {
        console.error("Error al obtener el perfil del usuario:", error);
        res.status(500).send("Error al obtener el perfil");
    }
});

// Vista en tiempo real con WebSockets
router.get("/realtimeproducts", async (req, res) => {
    res.render("realtimeproducts");
});

export default router;
