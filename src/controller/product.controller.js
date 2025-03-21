import ProductModel from "../models/product.model.js"; 

// Crear un producto
export const createProduct = async (req, res) => {
  try {
    const { title, description, price, img, code, stock, category, status, thumbnails } = req.body;
    const newProduct = new ProductModel({
      title,
      description,
      price,
      img,
      code,
      stock,
      category,
      status,
      thumbnails
    });

    await newProduct.save(); // Guardar el producto en la base de datos
    res.status(201).json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: "Error creating product", error: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; 
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
    };

    const products = await ProductModel.paginate({}, options); 
    res.status(200).json(products); 
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};

// Obtener un producto por su ID
export const getProductById = async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error: error.message });
  }
};

// Actualizar un producto
export const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await ProductModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
};

// Eliminar un producto
export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await ProductModel.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
};
