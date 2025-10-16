import { describe, it, expect, vi, beforeAll } from "vitest";
import { db } from "../../infrastructure/db/postgres";
import { Context } from "grammy";
import { CategoriesRepository } from "../../infrastructure/db/repositories/categories/categories.repository";
import { UsersRepository } from "../../infrastructure/db/repositories/users/users.repository";
import { CategoriesService } from "../../domain_service/categories/categories.service";
import { UsersService } from "../../domain_service/users/users.service";
import { CategoriesTelegramController } from "../../endpoints/categories/categories.controller";
import { categories } from "../../infrastructure/db/models/Categories";
import { users } from "../../infrastructure/db/models/Users";
import { eq } from "drizzle-orm";


function createMockCtx(
  from: Partial<Context["from"]> = {},
  message: Partial<Context["message"]> = {}
): Context {
  return {
    from: {
      id: 123456,
      first_name: "Артём",
      last_name: "Иванов",
      language_code: "ru",
      is_bot: false,
      username: "artem_dev",
      ...from,
    },
    message: {
      text: "/start",
      ...message,
    },
    reply: vi.fn(),
  } as unknown as Context;
}

describe("CategoriesTelegramController (integration)", () => {

const categoriesRepo = new CategoriesRepository();
  const usersRepo = new UsersRepository();
  const categoriesService = new CategoriesService(categoriesRepo);
  const usersService = new UsersService(usersRepo);
  const controller = new CategoriesTelegramController(categoriesService, usersService);

    beforeAll(async () => {
        await db.delete(categories);
        await db.delete(users);
    });

    it("returns empty list message if no categories", async () => {
        const ctx = createMockCtx();
        await controller.list(ctx);
        expect(ctx.reply).toHaveBeenCalledWith("📭 Категории пока не добавлены.");
    });

    it("creates multiple categories if user is admin", async () => {
        await usersService.create({
            telegramId: 999,
            firstName: "Admin",
            lastName: "Root",
            username: "admin_user",
            isBot: false,
            languageCode: "ru",
            phoneNumber: "+375291100000",
            role: "admin",
        });

        const categoryNames = ["Обувь", "Одежда", "Игрушки", "Техника"];
        for (const name of categoryNames) {
            const ctx = createMockCtx({ id: 999 }, { text: `/add_category ${name}` });
            await controller.create(ctx);
            expect(ctx.reply).toHaveBeenCalledWith(expect.stringContaining(`✅ Категория "${name}" создана`));
        }

        const result = await db.select().from(categories);
        expect(result.length).toBe(categoryNames.length);
        for (const name of categoryNames) {
            expect(result.some(c => c.name === name)).toBe(true);
        }
    });

    it("lists existing categories", async () => {
        const ctx = createMockCtx();
        await controller.list(ctx);
        expect(ctx.reply).toHaveBeenCalledWith(expect.stringContaining("📋 Список категорий:"));
        expect(ctx.reply).toHaveBeenCalledWith(expect.stringContaining("📦 Обувь"));
    });


    it("updates category name if user is admin", async () => {
        
        const created = await categoriesService.create({ name: "СтараяКатегория" });

        
        const ctx = createMockCtx({ id: 999 }, { text: `/update_category ${created.id} ОбновлённаяКатегория` });
        await controller.update(ctx);

        expect(ctx.reply).toHaveBeenCalledWith(
            expect.stringContaining(`✅ Категория обновлена: ОбновлённаяКатегория`)
        );

        const updated = await db.select().from(categories).where(eq(categories.id, created.id));
        expect(updated[0]?.name).toBe("ОбновлённаяКатегория");
    });

    it("fails to delete already deleted category", async () => {

        const created = await categoriesService.create({ name: "КатегорияДляУдаления" });
        
        const ctx1 = createMockCtx({ id: 999 }, { text: `/delete_category ${created.id}` });
        await controller.delete(ctx1);
        expect(ctx1.reply).toHaveBeenCalledWith(`🗑️ Категория ${created.id} удалена.`);

        const ctx2 = createMockCtx({ id: 999 }, { text: `/delete_category ${created.id}` });
        await controller.delete(ctx2);
        expect(ctx2.reply).toHaveBeenCalledWith("❌ Ошибка при удалении категории.");
    });




});