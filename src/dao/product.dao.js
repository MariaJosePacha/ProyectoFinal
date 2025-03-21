import ProductModel from "../models/product.model.js";

class ProductDAO {
  async create(productData) {
    return await ProductModel.create(productData);
  }

  async findById(id) {
    return await ProductModel.findById(id);
  }

  async findAll(query = {}) {
    return await ProductModel.find(query);
  }

  async update(id, updateData) {
    return await ProductModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id) {
    return await ProductModel.findByIdAndDelete(id);
  }
}

export default new ProductDAO();
