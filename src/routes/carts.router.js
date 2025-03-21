import express from "express";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import mongoose from "mongoose";
import { isValidObjectId } from 'mongoose';

const router = express.Router();

const verifyObjectId = (req, res, next) => {
    const { cid, pid } = req.params;
    if (!mongoose.Types.ObjectId.isValid(cid) || (pid && !mongoose.Types.ObjectId.isValid(pid))) {
        return res.status(400).json({ error: "Invalid cart or product ID" });
    }
    next();
};

// 1) Create a new empty cart
router.post("/", async (req, res) => {
    try {
        const newCart = new Cart({ products: [] });
        await newCart.save();
        res.status(201).json(newCart);  // Respond with status 201 (created)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error creating the cart" });
    }
});

// 2) List the products in the cart by id and render the `cart` view (HTML)
router.get("/:cid", verifyObjectId, async (req, res) => {
    const cartId = req.params.cid;

    try {
        const cart = await Cart.findById(cartId).populate("products.product");
        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }
        res.render("cart", { cart: cart.toObject() });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching cart products" });
    }
});

// 2) List the products in the cart by id and return JSON (for the API)
router.get("/api/:cid", verifyObjectId, async (req, res) => {
    const cartId = req.params.cid;

    try {
        const cart = await Cart.findById(cartId).populate("products.product");
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
        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }

        cart.products = cart.products.filter(product => product.product.toString() !== pid);
        await cart.save();

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
        const cart = await Cart.findById(cid);
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
        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }

        const productIndex = cart.products.findIndex(product => product.product.toString() === pid);
        if (productIndex === -1) {
            return res.status(404).json({ error: "Product not found in the cart" });
        }

        cart.products[productIndex].quantity = quantity;
        await cart.save();
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
        const cart = await Cart.findById(cid);
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
        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }

        const product = await Product.findById(pid);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        const productIndex = cart.products.findIndex(p => p.product.toString() === pid);
        if (productIndex !== -1) {
            cart.products[productIndex].quantity += quantity;
        } else {
            cart.products.push({ product: pid, quantity });
        }

        await cart.save();
        res.status(200).json(cart.products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error adding product to the cart" });
    }
});

export default router;
