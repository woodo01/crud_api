import { v4 as uuidv4 } from "uuid";
import { User } from "../models/user";

class UserStorage {
  users: Map<string, User> = new Map();

  getAllUsers(): Map<string, User> {
    return this.users;
  }

  findUser(id: string): User | null {
    return this.users.has(id) ? this.users.get(id) : null;
  }

  createUser(userData: Omit<User, 'id'>): User {
    const user: User = { id: uuidv4(), ...userData };
    this.users.set(user.id, user);
    return user;
  }

  updateUser(id: string, userData: Omit<User, 'id'>): User | null {
    const user: User = { id, ...userData };
    this.users.set(id, user);
    return null;
  }

  deleteUser(id: string): boolean {
    return this.users.delete(id);
  }
}
