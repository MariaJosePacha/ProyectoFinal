import bcrypt from "bcryptjs";
import UserDAO from "../daos/user.dao.js";

class UserService {
  async register(userData) {
    const { email, password } = userData;
    
    // Verificar si el usuario ya existe
    const existingUser = await UserDAO.findByEmail(email);
    if (existingUser) {
      throw new Error("Email already in use");
    }

    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear usuario
    return await UserDAO.create({ ...userData, password: hashedPassword });
  }

  async getUserByEmail(email) {
    return await UserDAO.findByEmail(email);
  }

  async getUserById(id) {
    return await UserDAO.findById(id);
  }

  async updateUser(id, updateData) {
    return await UserDAO.update(id, updateData);
  }

  async deleteUser(id) {
    return await UserDAO.delete(id);
  }
}

export default new UserService();
