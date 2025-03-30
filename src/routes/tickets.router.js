import express from 'express';
import Ticket from '../models/ticket.model.js';
import Product from '../models/product.model.js'; 
import { authenticate } from '../middlewares/authenticate.js';  // Corregido

const router = express.Router();

// Ruta para realizar una compra
router.post('/purchase', authenticate, async (req, res) => {  // Usando authenticate
  const { products } = req.body;  // Lista de productos a comprar
  const userId = req.user.id;     // Obtenemos el ID del usuario de la sesión

  if (!products || products.length === 0) {
    return res.status(400).send({ message: 'Debe seleccionar al menos un producto para comprar.' });
  }

  try {
    // Calculamos el total de la compra
    let totalAmount = 0;
    const purchasedProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).send({ message: `Producto con ID ${item.productId} no encontrado.` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).send({ message: `No hay suficiente stock para el producto ${product.name}.` });
      }

      // Actualizar el stock del producto
      product.stock -= item.quantity;
      await product.save();

      // Acumular el total de la compra
      totalAmount += product.price * item.quantity;

      // Añadir al array de productos comprados
      purchasedProducts.push({ productId: product._id, quantity: item.quantity });
    }

    // Crear el ticket de compra
    const ticket = new Ticket({
      user: userId,
      products: purchasedProducts,
      totalAmount,
      status: 'pending'  // El estado es 'pending' hasta que se confirme la compra
    });

    await ticket.save();

    return res.status(201).send({ message: 'Compra realizada con éxito', ticket });
  } catch (error) {
    return res.status(500).send({ message: 'Error al realizar la compra', error });
  }
});

export default router;
