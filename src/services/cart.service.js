import CartDAO from "../dao/cart.dao.js";

class CartService {
  async createCart() {
    try {
      const newCart = await CartDAO.create();
      return newCart;
    } catch (error) {
      throw new Error("Error creating the cart: " + error.message);  // Más contexto en el mensaje
    }
  }

  async getCartById(cartId) {
    try {
      const cart = await CartDAO.getCartById(cartId);
      if (!cart) {
        throw new Error(`Cart with ID ${cartId} not found`);  // Agregando el ID al mensaje de error
      }
      return cart;
    } catch (error) {
      throw new Error("Error fetching cart: " + error.message);
    }
  }

  async addProductToCart(cartId, productId, quantity) {
    try {
      const updatedCart = await CartDAO.addProductToCart(cartId, productId, quantity);
      return updatedCart;
    } catch (error) {
      throw new Error(`Error adding product ${productId} to cart ${cartId}: ` + error.message);
    }
  }

  async removeProductFromCart(cartId, productId) {
    try {
      const updatedCart = await CartDAO.removeProductFromCart(cartId, productId);
      return updatedCart;
    } catch (error) {
      throw new Error(`Error removing product ${productId} from cart ${cartId}: ` + error.message);
    }
  }

  async getAllCarts(query = {}, options = {}) {
    try {
      const carts = await CartDAO.findAll(query, options);
      return carts;
    } catch (error) {
      throw new Error("Error fetching carts: " + error.message);
    }
  }

  async updateCart(cartId, updateData) {
    try {
      const updatedCart = await CartDAO.update(cartId, updateData);
      return updatedCart;
    } catch (error) {
      throw new Error("Error updating cart: " + error.message);
    }
  }

  async deleteCart(cartId) {
    try {
      const deletedCart = await CartDAO.delete(cartId);
      return deletedCart;
    } catch (error) {
      throw new Error("Error deleting cart: " + error.message);
    }
  }
}

export default new CartService();
