import UserModel from "../models/user.model.js";
import { UserDTO } from "../dto/user.dto.js";

class UserDAO {
    async create(userData) {
        const user = await UserModel.create(userData);
        return new UserDTO(user);
    }

    async findById(id) {
        const user = await UserModel.findById(id);
        return user ? new UserDTO(user) : null;
    }

    async findByEmail(email) {
        const user = await UserModel.findOne({ email });
        return user ? new UserDTO(user) : null;
    }

    async findAll(query = {}, options = {}) {
        const users = await UserModel.paginate(query, options);
        return users.docs.map(user => new UserDTO(user));
    }

    async update(id, updateData) {
        const updatedUser = await UserModel.findByIdAndUpdate(id, updateData, { new: true });
        return updatedUser ? new UserDTO(updatedUser) : null;
    }

    async delete(id) {
        return await UserModel.findByIdAndDelete(id);
    }
}

export default new UserDAO();
