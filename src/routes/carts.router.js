import express from "express";
import { isValidObjectId } from 'mongoose';
import CartDAO from "../dao/cart.dao.js";  // Importa el CartDAO
import Product from "../models/product.model.js";  // Sigue necesitando el modelo Product para manejar productos

const router = express.Router();

const verifyObjectId = (req, res, next) => {
    const { cid, pid } = req.params;
    if (!isValidObjectId(cid) || (pid && !isValidObjectId(pid))) {
        return res.status(400).json({ error: "Invalid cart or product ID" });
    }
    next();
};

// 1) Create a new empty cart
router.post("/", async (req, res) => {
    try {
        const newCart = await CartDAO.create();  // Usamos el CartDAO para crear el carrito
        res.status(201).json(newCart);  // Respond with status 201 (created)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error creating the cart" });
    }
});

// 2) List the products in the cart by id and return JSON (for the API)
router.get("/api/:cid", verifyObjectId, async (req, res) => {
    const cartId = req.params.cid;

    try {
        const cart = await CartDAO.getCartById(cartId);  // Usamos el CartDAO para obtener el carrito
        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }
        res.status(200).json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching cart products" });
    }
});

// 3) Remove a product from the cart
router.delete("/:cid/products/:pid", verifyObjectId, async (req, res) => {
    const { cid, pid } = req.params;

    try {
        const cart = await CartDAO.getCartById(cid);  // Usamos el CartDAO para obtener el carrito
        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }

        await CartDAO.removeProductFromCart(cid, pid);  // Usamos el CartDAO para eliminar el producto
        res.status(200).json({ message: "Product removed from the cart" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error removing the product from the cart" });
    }
});

// 4) Update the cart with an array of products
router.put("/:cid", verifyObjectId, async (req, res) => {
    const { cid } = req.params;
    const { products } = req.body;

    try {
        const cart = await CartDAO.getCartById(cid);  // Usamos el CartDAO para obtener el carrito
        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }

        cart.products = products;
        await cart.save();
        res.status(200).json({ message: "Cart updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error updating the cart" });
    }
});

// 5) Update only the quantity of a product in the cart
router.put("/:cid/products/:pid", verifyObjectId, async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    try {
        const cart = await CartDAO.getCartById(cid);  // Usamos el CartDAO para obtener el carrito
        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }

        await CartDAO.addProductToCart(cid, pid);  // Usamos el CartDAO para añadir el producto
        res.status(200).json({ message: "Product quantity updated" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error updating the product quantity" });
    }
});

// 6) Remove all products from the cart
router.delete("/:cid", verifyObjectId, async (req, res) => {
    const { cid } = req.params;

    try {
        const cart = await CartDAO.getCartById(cid);  // Usamos el CartDAO para obtener el carrito
        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }

        cart.products = [];
        await cart.save();
        res.status(200).json({ message: "All products removed from the cart" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error removing products from the cart" });
    }
});

// 7) Add a product to the cart
router.post("/:cid/product/:pid", verifyObjectId, async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity = 1 } = req.body;

    try {
        const cart = await CartDAO.getCartById(cid);  // Usamos el CartDAO para obtener el carrito
        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }

        const product = await Product.findById(pid);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        await CartDAO.addProductToCart(cid, pid);  // Usamos el CartDAO para añadir el producto
        res.status(200).json({ message: "Product added to the cart" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error adding product to the cart" });
    }
});

export default router;
