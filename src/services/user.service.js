import bcrypt from "bcryptjs";
import UserDAO from "../dao/user.dao.js";

class UserService {
  async register(userData) {
    const { email, password } = userData;

    try {
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
    } catch (error) {
      throw new Error("Error registering user: " + error.message);  // Más contexto sobre el error
    }
  }

  async getUserByEmail(email) {
    try {
      return await UserDAO.findByEmail(email);
    } catch (error) {
      throw new Error(`Error fetching user with email ${email}: ` + error.message);
    }
  }

  async getUserById(id) {
    try {
      return await UserDAO.findById(id);
    } catch (error) {
      throw new Error(`Error fetching user with ID ${id}: ` + error.message);
    }
  }

  async updateUser(id, updateData) {
    try {
      return await UserDAO.update(id, updateData);
    } catch (error) {
      throw new Error(`Error updating user with ID ${id}: ` + error.message);
    }
  }

  async deleteUser(id) {
    try {
      return await UserDAO.delete(id);
    } catch (error) {
      throw new Error(`Error deleting user with ID ${id}: ` + error.message);
    }
  }
}

export default new UserService();
