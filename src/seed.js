import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.model.js";
import Product from "./models/product.model.js";

dotenv.config();

// Conexión a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Usuarios de prueba
const users = [
  {
    email: "admin@example.com",
    password: "admin123",
    role: "ADMIN",
    isVerified: true,
  },
  {
    email: "user1@example.com",
    password: "password123",
    role: "USER",
    isVerified: true,
  },
  {
    email: "user2@example.com",
    password: "password123",
    role: "USER",
    isVerified: false,
  },
  {
    email: "user3@example.com",
    password: "password123",
    role: "USER",
    isVerified: true,
  }
];

// Productos de prueba
const products = Array.from({ length: 40 }, (_, i) => ({
  title: `Product ${i + 1}`,
  description: `Description for product ${i + 1}`,
  price: Math.floor(Math.random() * 100) + 10,
  img: `https://via.placeholder.com/150?text=Product+${i + 1}`,
  code: `CODE${i + 1}`,
  stock: Math.floor(Math.random() * 50) + 1,
  category: ["electronics", "clothing", "food", "home", "other"][Math.floor(Math.random() * 5)], // Aseguramos que las categorías sean correctas
  status: ["available", "out of stock", "discontinued"][Math.floor(Math.random() * 3)], // Aseguramos que el estado sea correcto
  thumbnails: [`https://via.placeholder.com/100?text=Thumb+${i + 1}`],
}));

// Poblar la base de datos
const seedDB = async () => {
  await connectDB();

  try {
    // Limpiar colecciones
    await User.deleteMany();
    await Product.deleteMany();
    console.log("🗑 Cleared database");

    // Insertar datos
    const createdUsers = await User.insertMany(users);
    await Product.insertMany(products);

    console.log("✅ Database seeded successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    mongoose.connection.close();
  }
};

seedDB();
