import mongoose from "mongoose";
import { config } from "dotenv";

config(); // Asegura que las variables se carguen

console.log("Mongo URI:", process.env.MONGO_URI); // Verifica que se esté cargando

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("❌ ERROR: MONGO_URI no está definido en .env");
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => console.log("✅ Conectado a la base de datos"))
  .catch((error) => console.error("❌ Error en la conexión:", error));
