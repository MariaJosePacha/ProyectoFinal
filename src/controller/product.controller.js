import ProductService from "../services/product.service.js";
import ProductDTO from "../dto/product.dto.js"; // Importamos el DTO

// Crear un producto
export const createProduct = async (req, res) => {
  try {
    const productData = req.body;
    const newProduct = await ProductService.createProduct(productData);
    const productDTO = new ProductDTO(newProduct); 
    res.status(201).json({ message: "Product created successfully", product: productDTO });
  } catch (error) {
    res.status(500).json({ message: "Error creating product", error: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const options = { page: parseInt(page), limit: parseInt(limit) };

    const products = await ProductService.getAllProducts(options);
    const productsDTO = products.docs.map((prod) => new ProductDTO(prod)); 

    res.status(200).json({ ...products, docs: productsDTO });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};