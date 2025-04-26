import { generateUUID } from '../../../utils';

/**
 * Base repository interface that defines common methods for all repositories
 */
export interface BaseRepository<T> {
  findAll(): T[];
  findById(id: string): T | null;
  create(item: Partial<T>): T;
  update(id: string, item: Partial<T>): T | null;
  delete(id: string): T | null;
}

/**
 * Helper function to generate a random UUID
 */
export const generateRandomUUID = (): string => {
  return crypto.randomUUID();
};