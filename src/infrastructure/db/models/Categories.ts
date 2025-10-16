import { pgSchema, serial, text } from "drizzle-orm/pg-core";

const categorySchema = pgSchema("categories");

export const categories = categorySchema.table("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

export type Category = typeof categories.$inferSelect;