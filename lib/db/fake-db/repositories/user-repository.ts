import { User } from '../../schema';
import { BaseRepository, generateRandomUUID } from './base-repository';
import { generateHashedPassword } from '../../utils';
import {generateUUID} from "@/lib/utils";

/**
 * User repository interface that extends the base repository
 */
export interface UserRepository extends BaseRepository<User> {
  findByEmail(email: string): User[];
  createGuestUser(): User;
}

/**
 * In-memory implementation of the user repository
 */
export class InMemoryUserRepository implements UserRepository {
  private users: User[] = [];

  findAll(): User[] {
    return [...this.users];
  }

  findById(id: string): User | null {
    return this.users.find(user => user.id === id) || null;
  }

  findByEmail(email: string): User[] {
    return this.users.filter(user => user.email === email);
  }

  create(item: Partial<User>): User {
    const newUser: User = {
      id: item.id || generateRandomUUID(),
      email: item.email!,
      password: item.password!,
    };
    this.users.push(newUser);
    return { ...newUser };
  }

  createGuestUser(): User {
    const email = `guest-${Date.now()}`;
    const password = generateHashedPassword(generateUUID());
    
    const newUser: User = {
      id: generateRandomUUID(),
      email,
      password,
    };
    this.users.push(newUser);
    return { ...newUser };
  }

  update(id: string, item: Partial<User>): User | null {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return null;
    
    this.users[index] = { ...this.users[index], ...item };
    return { ...this.users[index] };
  }

  delete(id: string): User | null {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return null;
    
    const deletedUser = this.users[index];
    this.users.splice(index, 1);
    return { ...deletedUser };
  }
}