import express from "express";
import ProductService from "../services/product.service.js";  // Usar el servicio
import CartManager from "../managers/cart-manager.js";
import { authenticate, authorizeAdmin } from "../middlewares/authenticate.js"; 

const cartManager = new CartManager("./src/data/carts.json");
const router = express.Router();

// Root route GET (accesible para todos)
router.get("/", async (req, res) => {
  try {
    const { limit = 10, page = 1, query = '', sort = '' } = req.query;
    const limitParsed = parseInt(limit); 
    const pageParsed = parseInt(page);   

    if (isNaN(limitParsed) || isNaN(pageParsed) || limitParsed <= 0 || pageParsed <= 0) {
      return res.status(400).json({ error: "The parameters limit and page must be positive numbers." });
    }

    const options = { 
      page: pageParsed, 
      limit: limitParsed 
    };

    const products = await ProductService.getAllProducts({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { status: query === 'true' }
      ]
    }, options);  // Usar paginación

    if (sort === "asc") {
      products.docs.sort((a, b) => a.price - b.price);
    } else if (sort === "desc") {
      products.docs.sort((a, b) => b.price - a.price);
    }

    const totalPages = products.totalPages;
    const response = {
      status: "success",
      payload: products.docs,
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

// GET route to get a product by ID (accesible para todos)
router.get("/:pid", async (req, res) => {
  let id = req.params.pid;

  try {
    const product = await ProductService.getProductById(id);

    if (!product) {
      res.send("Product not found");
    } else {
      res.json(product);
    }
  } catch (error) {
    res.status(500).send("Server error");
  }
});

// POST route to add a product to the cart (accesible para todos)
router.post("/carts/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    await cartManager.addProductToCart(cid, pid);
    res.status(200).send("Product added to cart");
  } catch (error) {
    res.status(500).send("Error adding product to cart");
  }
});

// POST route to add a new product (solo administradores pueden acceder)
router.post("/", authenticate, authorizeAdmin, async (req, res) => {
  const newProduct = req.body;

  // Validar que el producto tiene todos los campos necesarios
  if (!newProduct.title || !newProduct.price || !newProduct.description) {
    return res.status(400).json({ error: "Missing required product fields." });
  }

  try {
    // Usar el servicio en lugar del DAO directamente
    await ProductService.createProduct(newProduct);  
    res.status(201).json({ message: "Product added successfully" });
  } catch (error) {
    console.error(error); // Para saber qué salió mal
    res.status(500).json({ error: "There was an error adding the product" });
  }
});

// PUT route to update a product (solo administradores pueden acceder)
router.put("/:pid", authenticate, authorizeAdmin, async (req, res) => {
  const id = req.params.pid;
  const updatedProduct = req.body;

  try {
    await ProductService.updateProduct(id, updatedProduct);  // Usar el servicio
    res.send("Product updated successfully");
  } catch (error) {
    res.status(500).send("Error updating the product");
  }
});

// DELETE route to delete a product (solo administradores pueden acceder)
router.delete("/:pid", authenticate, authorizeAdmin, async (req, res) => {
  let id = req.params.pid;

  try {
    await ProductService.deleteProduct(id);  // Usar el servicio
    res.send("Product deleted");
  } catch (error) {
    res.status(500).send("Error, could not delete the product");
  }
});

export default router;
