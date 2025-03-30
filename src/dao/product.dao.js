import ProductModel from "../models/product.model.js";
import { ProductDTO } from "../dto/product.dto.js";

class ProductDAO {
    async create(productData) {
        const product = await ProductModel.create(productData);
        return new ProductDTO(product);
    }

    async findById(id) {
        const product = await ProductModel.findById(id);
        return product ? new ProductDTO(product) : null;
    }

    async findAll(query = {}, options = {}) {
        const products = await ProductModel.paginate(query, options);
        return products.docs.map(product => new ProductDTO(product));
    }

    async update(id, updateData) {
        const updatedProduct = await ProductModel.findByIdAndUpdate(id, updateData, { new: true });
        return updatedProduct ? new ProductDTO(updatedProduct) : null;
    }

    async delete(id) {
        return await ProductModel.findByIdAndDelete(id);
    }
}

export default new ProductDAO();
