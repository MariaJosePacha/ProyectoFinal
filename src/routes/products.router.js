import express from "express";
import ProductManager from "../managers/product-manager.js";
import CartManager from "../managers/cart-manager.js";

const manager = new ProductManager("./src/data/products.json");
const cartManager = new CartManager("./src/data/carts.json");
const router = express.Router();

// Root route GET
router.get("/", async (req, res) => {
    try {
        const { limit = 10, page = 1, query = '', sort = '' } = req.query;
        const limitParsed = parseInt(limit); 
        const pageParsed = parseInt(page);   

        if (isNaN(limitParsed) || isNaN(pageParsed) || limitParsed <= 0 || pageParsed <= 0) {
            return res.status(400).json({ error: "The parameters limit and page must be positive numbers." });
        }

        const products = await manager.getProducts();

        let filteredProducts = products.filter(product => {
            return (
                product.title.toLowerCase().includes(query.toLowerCase()) ||
                product.description.toLowerCase().includes(query.toLowerCase()) ||
                product.category.toLowerCase().includes(query.toLowerCase()) ||
                (query.toLowerCase() === "true" && product.status === true) ||
                (query.toLowerCase() === "false" && product.status === false)
            );
        });

        // Sort products if 'sort' is provided
        if (sort === "asc") {
            filteredProducts.sort((a, b) => a.price - b.price);
        } else if (sort === "desc") {
            filteredProducts.sort((a, b) => b.price - a.price);
        }

        const totalProducts = filteredProducts.length;
        const totalPages = Math.ceil(totalProducts / limitParsed);

        const startIndex = (pageParsed - 1) * limitParsed;
        const endIndex = startIndex + limitParsed;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

        const response = {
            status: "success",
            payload: paginatedProducts,
            totalPages,
            prevPage: pageParsed > 1 ? pageParsed - 1 : null,
            nextPage: pageParsed < totalPages ? pageParsed + 1 : null,
            page: pageParsed,
            hasPrevPage: pageParsed > 1,
            hasNextPage: pageParsed < totalPages,
            prevLink: pageParsed > 1 ? `/products?page=${pageParsed - 1}&limit=${limitParsed}` : null,
            nextLink: pageParsed < totalPages ? `/products?page=${pageParsed + 1}&limit=${limitParsed}` : null
        };

        res.json(response);
    } catch (error) {
        res.status(500).send("Internal server error");
    }
});

// GET route to get a product by ID
router.get("/:pid", async (req, res) => {
    let id = req.params.pid;

    try {
        const product = await manager.getProductById(id);

        if (!product) {
            res.send("Product not found");
        } else {
            res.json(product);
        }
    } catch (error) {
        res.status(500).send("Server error");
    }
});

// POST route to add a product to the cart
router.post("/carts/:cid/product/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;
        await cartManager.addProductToCart(cid, pid);
        res.status(200).send("Product added to cart");
    } catch (error) {
        res.status(500).send("Error adding product to cart");
    }
});

// POST route to add a new product
router.post("/", async (req, res) => {
    const newProduct = req.body;

    // Validate that the product has all necessary fields
    if (!newProduct.title || !newProduct.price || !newProduct.description) {
        return res.status(400).json({ error: "Missing required product fields." });
    }

    try {
        // Try to add the product
        await manager.addProduct(newProduct);
        res.status(201).json({ message: "Product added successfully" });
    } catch (error) {
        console.error(error); // To know what went wrong
        res.status(500).json({ error: "There was an error adding the product" });
    }
});

// PUT route to update a product
router.put("/:pid", async (req, res) => {
    const id = req.params.pid;
    const updatedProduct = req.body;

    try {
        await manager.updateProduct(id, updatedProduct);
        res.send("Product updated successfully");
    } catch (error) {
        res.status(500).send("Error updating the product");
    }
});

// DELETE route to delete a product
router.delete("/:pid", async (req, res) => {
    let id = req.params.pid;

    try {
        await manager.deleteProduct(id);
        res.send("Product deleted");
    } catch (error) {
        res.status(500).send("Error, could not delete the product");
    }
});

export default router;
