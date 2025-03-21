import Cart from '../models/cart.model.js'; 

export const createCart = async () => {
    const newCart = new Cart({ products: [] });  
    await newCart.save();
    return newCart;
};

export const getCartById = async (cartId) => {
    return await Cart.findById(cartId).populate('products'); 
};

export const addProductToCart = async (cartId, productId) => {
    const cart = await Cart.findById(cartId);
    if (cart) {
        cart.products.push(productId);  
        await cart.save();
        return cart;
    }
    throw new Error('Cart not found');
};

export const removeProductFromCart = async (cartId, productId) => {
    const cart = await Cart.findById(cartId);
    if (cart) {
        cart.products = cart.products.filter((p) => p.toString() !== productId.toString()); // Eliminamos el producto
        await cart.save();
        return cart;
    }
    throw new Error('Cart not found');
};
