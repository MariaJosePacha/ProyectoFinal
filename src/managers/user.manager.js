import UserModel from "../models/user.model.js"; 
import bcrypt from "bcryptjs"; 

// Crear un nuevo usuario
export const createUser = async (userData) => {
  try {
    const { username, email, password, role } = userData;

    // Verificar si el email ya está registrado
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw new Error("Email already in use");
    }

  
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new UserModel({
      username,
      email,
      password: hashedPassword,
      role
    });

    await newUser.save(); 
    return newUser;
  } catch (error) {
    throw new Error(`Error creating user: ${error.message}`);
  }
};

// Obtener un usuario por su ID
export const getUserById = async (id) => {
  try {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    throw new Error(`Error fetching user: ${error.message}`);
  }
};

export const getUserByEmail = async (email) => {
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    throw new Error(`Error fetching user by email: ${error.message}`);
  }
};

// Actualizar un usuario
export const updateUser = async (id, updatedData) => {
  try {
    if (updatedData.password) {
      const salt = await bcrypt.genSalt(10);
      updatedData.password = await bcrypt.hash(updatedData.password, salt);
    }

    const updatedUser = await UserModel.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedUser) {
      throw new Error("User not found");
    }
    return updatedUser;
  } catch (error) {
    throw new Error(`Error updating user: ${error.message}`);
  }
};

// Eliminar un usuario
export const deleteUser = async (id) => {
  try {
    const deletedUser = await UserModel.findByIdAndDelete(id);
    if (!deletedUser) {
      throw new Error("User not found");
    }
    return deletedUser;
  } catch (error) {
    throw new Error(`Error deleting user: ${error.message}`);
  }
};

// Verificar si la contraseña es correcta (usado para el login)
export const checkPassword = async (inputPassword, storedPassword) => {
  try {
    const isMatch = await bcrypt.compare(inputPassword, storedPassword);
    return isMatch;
  } catch (error) {
    throw new Error(`Error checking password: ${error.message}`);
  }
};
