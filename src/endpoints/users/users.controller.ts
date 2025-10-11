import { Context } from "grammy";
import { UsersServcie } from "../../domain_service/users/users.service";
import { CreateUserDto, DeleteUserDto, GetUserByTelegramIdDto, SortUsersDto, UpdateUserDto } from "../../endpoints/users/user.dto";

export function getTelegramId(ctx: Context): number | null {
  return ctx.from?.id ?? null;
}

export class UsersTelegramController {
    constructor (private readonly usersService: UsersServcie){}
   
    async create(ctx: Context) {
        const telegramId = getTelegramId(ctx);
        if (!telegramId) {
            await ctx.reply("❌ Не удалось определить пользователя.");
            return;
        }

       const dto: CreateUserDto = {
            telegramId,
            firstName: ctx.from!.first_name,
            lastName: ctx.from?.last_name ?? null,
            languageCode: ctx.from?.language_code ?? null,
            phoneNumber: null,
            isBot: ctx.from!.is_bot,
            ...(ctx.from?.username && { username: ctx.from.username }), 
        };

        try {
            await this.usersService.create(dto);
            await ctx.reply("👋 Добро пожаловать! Профиль создан.");
            await this.profile(ctx); 
        } catch (err) {
            if (err instanceof Error && err.message.includes("already exists")) {
            await ctx.reply("✅ Вы уже зарегистрированы.");
            await this.profile(ctx); 
            } else {
            await ctx.reply(`❌ Ошибка: ${err instanceof Error ? err.message : "Неизвестная ошибка."}`);
            }
        }
    }

    async profile(ctx: Context) {
        const telegramId = getTelegramId(ctx);
        if (!telegramId) {
            await ctx.reply("❌ Не удалось определить пользователя.");
            return;
        }

        const dto: GetUserByTelegramIdDto = { telegramId };
        const user = await this.usersService.getByTelegramId(dto);

        if (!user) {
            await ctx.reply("❌ Профиль не найден.");
            return;
        }

        await ctx.reply(
            `👤 Профиль:\nИмя: ${user.firstName}\nФамилия: ${user.lastName ?? "—"}\nUsername: ${user.username ? `@${user.username}` : "—"}`
        );
    }


    async delete(ctx: Context) {
        const telegramId = getTelegramId(ctx);
        if (!telegramId) {
            await ctx.reply("❌ Не удалось определить пользователя.");
            return;
        }

        const dto: DeleteUserDto = { telegramId };

        try {
            await this.usersService.delete(dto);
            await ctx.reply("🗑️ Профиль удалён.");
        } catch (err) {
            await ctx.reply("❌ Профиль не найден.");
        }
    }

    async update(ctx: Context, updates: UpdateUserDto["updates"]) {
        const telegramId = getTelegramId(ctx);
        if (!telegramId) {
            await ctx.reply("❌ Не удалось определить пользователя.");
            return;
        }

        const dto: UpdateUserDto = {
            telegramId,
            updates,
        };

        try {
            await this.usersService.update(dto);
            await ctx.reply("✅ Профиль обновлён.");
        } catch (err) {
            await ctx.reply("❌ Ошибка при обновлении.");
        }
    }
 
    async list(ctx: Context): Promise<void> {
        const telegramId = ctx.from?.id;
        if (!telegramId) {
            await ctx.reply("❌ Не удалось определить пользователя.");
            return;
        }

        const isAdmin = await this.usersService.isAdmin(telegramId);
        if (!isAdmin) {
            await ctx.reply("⛔ У вас нет прав для просмотра списка пользователей.");
            return;
        }

        const page = parseInt(ctx.message?.text?.split(" ")[1] ?? "1");
        const users = await this.usersService.List({ page, pageSize: 100 });

        if (users.length === 0) {
            await ctx.reply("📭 Нет пользователей на этой странице.");
            return;
        }

        const formatted = users.map(u => `👤 ${u.firstName} (@${u.username ?? "—"})`).join("\n");
        await ctx.reply(`📋 Страница ${page}:\n${formatted}`);
    }


    
    async check(ctx: Context): Promise<void> {
        const telegramId = getTelegramId(ctx);
        if (!telegramId) {
            await ctx.reply("❌ Не удалось определить пользователя.");
            return;
        }

        const exists = await this.usersService.exists({ telegramId });
        await ctx.reply(exists ? "✅ Вы зарегистрированы." : "❌ Вы не зарегистрированы.");
    }


    async linkPhone(ctx: Context): Promise<void> {
        const telegramId = getTelegramId(ctx);
        const phone = ctx.message?.contact?.phone_number;

        if (!telegramId || !phone) {
            await ctx.reply("❌ Не удалось получить номер.");
            return;
        }

        await this.usersService.update({ telegramId, updates: { phoneNumber: phone } });
        await ctx.reply("📞 Номер телефона привязан.");
    }



    async sortedList(ctx: Context): Promise<void> {
        const telegramId = getTelegramId(ctx);
        if (!telegramId) {
            await ctx.reply("❌ Не удалось определить пользователя.");
            return;
        }

        const isAdmin = await this.usersService.isAdmin(telegramId);
        if (!isAdmin) {
            await ctx.reply("⛔ У вас нет прав для сортировки пользователей.");
            return;
        }

        const args = ctx.message?.text?.split(" ") ?? [];
        const field = args[1];
        const direction = args[2] === "desc" ? "desc" : "asc";

        if (!field) {
            await ctx.reply("❌ Укажите поле сортировки. Пример: /users_sort createdAt desc");
            return;
        }

        const allowedFields = ["firstName", "createdAt", "role", "username"];
        if (!allowedFields.includes(field)) {
            await ctx.reply(`❌ Недопустимое поле сортировки. Допустимые: ${allowedFields.join(", ")}`);
            return;
        }

        const dto: SortUsersDto = {
            field: field as SortUsersDto["field"],
            direction,
        };

        const users = await this.usersService.getSortedUsers(dto);

        if (users.length === 0) {
            await ctx.reply("📭 Нет пользователей.");
            return;
        }

        const formatted = users.map(u =>
        `👤 ${u.firstName} ${u.lastName ?? ""} | ${u.username ?? "—"} | ${u.role}`
        ).join("\n");

        await ctx.reply(`📋 Сортировка по ${dto.field} (${dto.direction}):\n\n${formatted}`);
    }
    
}

