import CartModel from "../models/cart.model.js";
import { CartDTO } from "../dto/cart.dto.js";

class CartDAO {
    // Crear un carrito
    async create() {
        const newCart = new CartModel({ products: [] });
        await newCart.save();
        return new CartDTO(newCart);
    }

    // Obtener un carrito por su ID
    async getCartById(cartId) {
        const cart = await CartModel.findById(cartId).populate("products");
        return cart ? new CartDTO(cart) : null;
    }

    // Agregar un producto a un carrito
    async addProductToCart(cartId, productId, quantity) {
        const cart = await CartModel.findById(cartId);
        if (!cart) throw new Error("Cart not found");

        const existingProduct = cart.products.find(p => p.product.toString() === productId.toString());
        if (existingProduct) {
            existingProduct.quantity += quantity; // Incrementar la cantidad si el producto ya existe
        } else {
            cart.products.push({ product: productId, quantity });
        }
        
        await cart.save();
        return new CartDTO(cart);
    }

    // Eliminar un producto de un carrito
    async removeProductFromCart(cartId, productId) {
        const cart = await CartModel.findById(cartId);
        if (!cart) throw new Error("Cart not found");

        cart.products = cart.products.filter(p => p.product.toString() !== productId.toString());
        await cart.save();
        return new CartDTO(cart);
    }

    // Vaciar un carrito
    async clearCart(cartId) {
        const cart = await CartModel.findById(cartId);
        if (!cart) throw new Error("Cart not found");

        cart.products = [];
        await cart.save();
        return new CartDTO(cart);
    }

    // Obtener todos los carritos con paginación
    async findAll(query = {}, options = {}) {
        const carts = await CartModel.paginate(query, options);
        return carts.docs.map(cart => new CartDTO(cart));
    }

    // Actualizar un carrito
    async update(id, updateData) {
        const updatedCart = await CartModel.findByIdAndUpdate(id, updateData, { new: true });
        return updatedCart ? new CartDTO(updatedCart) : null;
    }

    // Eliminar un carrito
    async delete(id) {
        return await CartModel.findByIdAndDelete(id);
    }
}

export default new CartDAO();
