import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
    user: {  
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users', 
        required: true
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'products', 
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1 
            }
        }
    ],
    state: {
        type: String,
        enum: ['reserved', 'paid', 'delivered'], 
        default: 'reserved',
        required: true
    }
});


cartSchema.pre("find", function(next) {  
    this.populate("products.product");
    next();
});

cartSchema.pre("findOne", function(next) {
    this.populate("products.product");
    next();
});

const Cart = mongoose.model('Cart', cartSchema); 
export default Cart;
