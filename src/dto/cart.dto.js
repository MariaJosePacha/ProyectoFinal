export class CartDTO {
    constructor(cart) {
        this.id = cart._id;
        this.products = cart.products.map(p => ({
            productId: p._id.toString(),
            quantity: p.quantity
        }));
    }
}
