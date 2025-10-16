import { User } from '../../models/Users';
import { SortableUserFields } from '../../../../shared/types/SortableUserFields';

export interface IUsersRepository {
  create(user: User): Promise<void>;
  update(telegramId: number, updates: Partial<User>): Promise<void>;
  delete(telegramId: number): Promise<void>;
  findManyPaginated(page: number, pageSize: number): Promise<User[]>;
  findByTelegramId(telegramId: number): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  exists(telegramId: number): Promise<boolean>;
  findSorted(field: SortableUserFields, direction: 'asc' | 'desc'): Promise<User[]>;
}

