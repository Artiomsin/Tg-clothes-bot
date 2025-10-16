import { Context } from "grammy";
import { CategoriesService } from "../../domain_service/categories/categories.service";
import { UsersService } from "../../domain_service/users/users.service";
export class CategoriesTelegramController{
    
    constructor(private readonly categoriesService: CategoriesService,private readonly usersService: UsersService) {}
    

    async list(ctx: Context):Promise<void>{
        const categories=await this.categoriesService.getAll();
        if (categories.length===0){
            await ctx.reply("📭 Категории пока не добавлены.");
            return;
        }

        const formatted = categories.map(c => `📦 ${c.name} (id: ${c.id})`).join("\n");
        await ctx.reply(`📋 Список категорий:\n\n${formatted}`);

    }

    async create(ctx: Context): Promise<void> {
        const telegramId = ctx.from?.id;
        if (!telegramId) {
        await ctx.reply("❌ Не удалось определить пользователя.");
        return;
        }

        const isAdmin = await this.usersService.isAdmin(telegramId);
        if (!isAdmin) {
        await ctx.reply("⛔ У вас нет прав для создания категории.");
        return;
        }

        const name = ctx.message?.text?.split(" ").slice(1).join(" ");
        if (!name) {
        await ctx.reply("❌ Укажите название категории. Пример: /add_category Обувь");
        return;
        }

        try {
        const created = await this.categoriesService.create({ name });
        await ctx.reply(`✅ Категория "${created.name}" создана (id: ${created.id})`);
        } catch (err) {
        await ctx.reply("❌ Ошибка при создании категории.");
        }
    }

    async update(ctx: Context): Promise<void> {
        const telegramId = ctx.from?.id;
        if (!telegramId) {
            await ctx.reply("❌ Не удалось определить пользователя.");
            return;
        }

        const isAdmin = await this.usersService.isAdmin(telegramId);
        if (!isAdmin) {
            await ctx.reply("⛔ У вас нет прав для обновления категории.");
            return;
        }

        const text = ctx.message?.text;
        if (!text) {
            await ctx.reply("❌ Команда не содержит текста.");
            return;
        }

        const args = text.split(" ");
        const idRaw = args[1];
        const name = args.slice(2).join(" ").trim();

        if (!idRaw || name.length === 0) {
        await ctx.reply("❌ Пример: /update_category 2 НовоеНазвание");
        return;
        }

        const id = parseInt(idRaw);
        if (isNaN(id)) {
        await ctx.reply("❌ ID должен быть числом.");
        return;
        }

        const updated = await this.categoriesService.update({ id, name });
        await ctx.reply(`✅ Категория обновлена: ${updated.name} (id: ${updated.id})`);
    }

    async delete(ctx: Context): Promise<void> {
        const telegramId = ctx.from?.id;
        if (!telegramId) {
        await ctx.reply("❌ Не удалось определить пользователя.");
        return;
        }

        const isAdmin = await this.usersService.isAdmin(telegramId);
        if (!isAdmin) {
        await ctx.reply("⛔ У вас нет прав для удаления категории.");
        return;
        }

        const id = parseInt(ctx.message?.text?.split(" ")[1] ?? "");
        if (isNaN(id)) {
        await ctx.reply("❌ Укажите id категории. Пример: /delete_category 3");
        return;
        }

        try {
        await this.categoriesService.delete({ id });
        await ctx.reply(`🗑️ Категория ${id} удалена.`);
        } catch (err) {
        await ctx.reply("❌ Ошибка при удалении категории.");
        }
    }

}