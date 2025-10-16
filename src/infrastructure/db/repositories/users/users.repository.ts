import { User } from '../../models/Users';
import { db } from '../../postgres';
import { users } from '../../models/Users';
import { IUsersRepository } from './IUsersRepository';
import { eq, asc, desc} from 'drizzle-orm';
import { SortableUserFields } from '../../../../shared/types/SortableUserFields';

const fieldToColumnMap: Record<SortableUserFields, any> = {
  firstName: users.firstName,
  createdAt: users.createdAt,
  role: users.role,
  username: users.username,
};

export class UsersRepository implements IUsersRepository {
  async create(user: User): Promise<void> {
    await db.insert(users).values(user);
  }

  async update(telegramId: number, updates: Partial<User>): Promise<void> {
    await db.update(users)
      .set(updates)
      .where(eq(users.telegramId, telegramId));
  }

  async delete(telegramId: number): Promise<void> {
    await db.delete(users).where(eq(users.telegramId, telegramId));
  }

  async findManyPaginated(page: number, pageSize: number): Promise<User[]> {
  const offset = (page - 1) * pageSize;

  return await db
    .select()
    .from(users)
    .limit(pageSize)
    .offset(offset);
}


  async findByTelegramId(telegramId: number): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.telegramId, telegramId))
      .limit(1);
    return result[0] ?? null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return result[0] ?? null;
  }

  async exists(telegramId: number): Promise<boolean> {
    const result = await db
      .select({ telegramId: users.telegramId })
      .from(users)
      .where(eq(users.telegramId, telegramId))
      .limit(1);
    return result.length > 0;
  }

  async findSorted(field: SortableUserFields, direction: 'asc' | 'desc'): Promise<User[]> {
    const column = fieldToColumnMap[field];
    if (!column) throw new Error(`Unsupported sort field: ${field}`);

    return await db
      .select()
      .from(users)
      .orderBy(direction === 'asc' ? asc(column) : desc(column));
  }

}