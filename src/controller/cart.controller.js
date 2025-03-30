import CartService from "../services/cart.service.js";
import CartDTO from "../dto/cart.dto.js"; // Importamos el DTO

// Crear un carrito
export const createCart = async (req, res) => {
  try {
    const newCart = await CartService.createCart();
    const cartDTO = new CartDTO(newCart);
    res.status(201).json({ message: "Cart created successfully", cart: cartDTO });
  } catch (error) {
    res.status(500).json({ message: "Error creating cart", error: error.message });
  }
};

// Obtener un carrito por su ID
export const getCartById = async (req, res) => {
  try {
    const cart = await CartService.getCartById(req.params.id);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const cartDTO = new CartDTO(cart);
    res.status(200).json(cartDTO);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart", error: error.message });
  }
};

// Agregar un producto a un carrito
export const addProductToCart = async (req, res) => {
  try {
    const { cartId, productId, quantity } = req.body;
    const updatedCart = await CartService.addProductToCart(cartId, productId, quantity);
    if (!updatedCart) {
      return res.status(404).json({ message: "Cart or Product not found" });
    }
    const cartDTO = new CartDTO(updatedCart);
    res.status(200).json({ message: "Product added to cart", cart: cartDTO });
  } catch (error) {
    res.status(500).json({ message: "Error adding product to cart", error: error.message });
  }
};

// Eliminar un producto de un carrito
export const removeProductFromCart = async (req, res) => {
  try {
    const { cartId, productId } = req.params;
    const updatedCart = await CartService.removeProductFromCart(cartId, productId);
    if (!updatedCart) {
      return res.status(404).json({ message: "Cart or Product not found" });
    }
    const cartDTO = new CartDTO(updatedCart);
    res.status(200).json({ message: "Product removed from cart", cart: cartDTO });
  } catch (error) {
    res.status(500).json({ message: "Error removing product from cart", error: error.message });
  }
};

// Vaciar un carrito
export const clearCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    const clearedCart = await CartService.clearCart(cartId);
    if (!clearedCart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const cartDTO = new CartDTO(clearedCart);
    res.status(200).json({ message: "Cart cleared", cart: cartDTO });
  } catch (error) {
    res.status(500).json({ message: "Error clearing cart", error: error.message });
  }
};
