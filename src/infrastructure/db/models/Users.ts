import { bigint, boolean, pgSchema, text, timestamp } from "drizzle-orm/pg-core";

const usersSchema= pgSchema('users');

export const users = usersSchema.table('users',{
    telegramId: bigint('telegram_id', { mode: 'number' }).primaryKey(),
        username: text('username'),
        firstName: text('first_name').notNull(),
        lastName: text('last_name'),
        languageCode: text('language_code'),
        phoneNumber: text('phone_number'),
        isBot: boolean('is_bot').default(false).notNull(),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
        role: text('role').default('user').notNull(),
});

export type User = typeof users.$inferSelect;