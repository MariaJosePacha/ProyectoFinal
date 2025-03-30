import ProductDAO from "../dao/product.dao.js";

class ProductService {
  async createProduct(productData) {
    try {
      return await ProductDAO.create(productData);
    } catch (error) {
      throw new Error("Error creating product: " + error.message);
    }
  }

  async getProductById(id) {
    try {
      return await ProductDAO.findById(id);
    } catch (error) {
      throw new Error(`Error fetching product with ID ${id}: ` + error.message);
    }
  }

  async getAllProducts(query = {}) {
    try {
      return await ProductDAO.findAll(query);
    } catch (error) {
      throw new Error("Error fetching all products: " + error.message);
    }
  }

  async updateProduct(id, updateData) {
    try {
      return await ProductDAO.update(id, updateData);
    } catch (error) {
      throw new Error(`Error updating product with ID ${id}: ` + error.message);
    }
  }

  async deleteProduct(id) {
    try {
      return await ProductDAO.delete(id);
    } catch (error) {
      throw new Error(`Error deleting product with ID ${id}: ` + error.message);
    }
  }
}

export default new ProductService();
