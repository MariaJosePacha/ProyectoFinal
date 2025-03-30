import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Usuario que realiza la compra
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },  // Referencia al producto
      quantity: { type: Number, required: true, min: 1 }  // Cantidad de productos comprados
    }
  ],
  totalAmount: { type: Number, required: true },  // Total de la compra
  status: { type: String, default: 'pending' },  // Estado de la compra: 'pending', 'completed', 'cancelled'
  createdAt: { type: Date, default: Date.now },  // Fecha de creación de la compra
  updatedAt: { type: Date, default: Date.now }   // Fecha de actualización
});

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;
