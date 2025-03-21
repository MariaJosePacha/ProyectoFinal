import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2"; 

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    default: 1,
    min: [0, "Price cannot be negative"], 
  },
  img: {
    type: String,
    default: "default-product-img.jpg", 
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  stock: {
    type: Number,
    required: true,
    default: 1,
    min: [0, "Stock cannot be negative"], 
  },
  category: {
    type: String,
    required: true,
    enum: ["electronics", "clothing", "food", "home", "other"], 
    default: "other", 
  },
  status: {
    type: String,
    required: true,
    enum: ["available", "out of stock", "discontinued"], 
    default: "available", 
  },
  thumbnails: {
    type: [String],
    default: ["default-thumbnail.jpg"], 
  },
});

productSchema.plugin(mongoosePaginate);

const ProductModel = mongoose.model("Product", productSchema); 
export default ProductModel;
