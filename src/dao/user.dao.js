import UserModel from "../models/user.model.js";

class UserDAO {
  async create(userData) {
    return await UserModel.create(userData);
  }

  async findById(id) {
    return await UserModel.findById(id);
  }

  async findByEmail(email) {
    return await UserModel.findOne({ email });
  }

  async update(id, updateData) {
    return await UserModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id) {
    return await UserModel.findByIdAndDelete(id);
  }
}

export default new UserDAO();
