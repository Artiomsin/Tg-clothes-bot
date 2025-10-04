import { bigint, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: bigint('id', { mode: 'number' }).primaryKey().notNull(),
  username: text('username'),
  firstName: text('first_name').notNull(),
  lastName: text('last_name'),
  email: text('email'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
