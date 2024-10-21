import { v4 as uuidv4 } from "uuid";
import { User } from "../models/user";

class UserStorage {
  private users: Map<string, User> = new Map();

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  findUser(id: string): User | undefined {
    return this.users.get(id);
  }

  createUser(userData: Omit<User, 'id'>): User | undefined {
    const user: User = { id: uuidv4(), ...userData };
    this.users.set(user.id, user);
    return this.users.get(user.id);
  }

  updateUser(id: string, userData: Omit<User, 'id'>): User | undefined {
    const user: User = { id, ...userData };
    this.users.set(id, user);
    return this.users.get(user.id);
  }

  deleteUser(id: string): boolean {
    return this.users.delete(id);
  }
}

export default new UserStorage() as UserStorage;
