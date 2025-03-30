export class ProductDTO {
    constructor(product) {
        this.id = product._id;
        this.name = product.name;
        this.price = product.price;
        this.category = product.category;
        this.stock = product.stock;
    }
}
