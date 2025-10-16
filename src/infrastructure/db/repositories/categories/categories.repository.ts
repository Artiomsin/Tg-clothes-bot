import { ICategoriesRepository } from "./ICategoriesRepository";
import { Category } from "../../models/Categories";
import { db } from "../../postgres";
import { categories } from "../../models/Categories";
import { eq } from "drizzle-orm";

export class CategoriesRepository implements ICategoriesRepository{

    async create(name: string): Promise<Category> {
        const [created] = await db.insert(categories).values({ name }).returning();
        if (!created) throw new Error("Failed to create category");
        return created;
    }

    async update(id: number, name: string): Promise<Category> {
         const [updated] = await db
      .update(categories)
      .set({ name })
      .where(eq(categories.id, id))
      .returning();
      if (!updated) throw new Error("Failed to update category");
    return updated;
    }

    async delete(id: number): Promise<void> {
        await db.delete(categories).where(eq(categories.id, id));
    }

    async getAll(): Promise<Category[]> {
        return await db.select().from(categories);
    }
    
    async getById(id: number): Promise<Category | null> {
        const result  = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));
    return result[0] ?? null;
    }
}