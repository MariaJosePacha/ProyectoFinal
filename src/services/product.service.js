import ProductDAO from "../daos/product.dao.js";

class ProductService {
  async createProduct(productData) {
    return await ProductDAO.create(productData);
  }

  async getProductById(id) {
    return await ProductDAO.findById(id);
  }

  async getAllProducts(query = {}) {
    return await ProductDAO.findAll(query);
  }

  async updateProduct(id, updateData) {
    return await ProductDAO.update(id, updateData);
  }

  async deleteProduct(id) {
    return await ProductDAO.delete(id);
  }
}

export default new ProductService();
