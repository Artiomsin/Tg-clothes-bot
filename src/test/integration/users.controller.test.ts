import { describe, it, expect, vi, beforeAll } from 'vitest';
import { db } from '../../infrastructure/db/postgres';
import { users } from '../../infrastructure/db/models/Users';
import { UsersService } from '../../domain_service/users/users.service';
import { UsersTelegramController } from '../../endpoints/users/users.controller';
import { UsersRepository } from '../../infrastructure/db/repositories/users/users.repository';
import { Context } from 'grammy';
import { eq } from 'drizzle-orm';
import { UpdateUserDto } from '../../endpoints/users/user.dto';


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
      contact: {
        phone_number: "+375291112233",
      },
      text: "/start",
      ...message, 
    },
    reply: vi.fn(),
  } as unknown as Context;
}


describe('UsersTelegramController (integration)', () => {
  const repo = new UsersRepository();
  const service = new UsersService(repo);
  const controller = new UsersTelegramController(service);

  beforeAll(async () => {
    await db.delete(users); // очищаем таблицу один раз перед запуском всех тестов
  });

  it('creates a user with full data and returns profile', async () => {
    const ctx = createMockCtx();

    await controller.create(ctx);
    await controller.linkPhone(ctx); 
    await controller.profile(ctx);

    expect(ctx.reply).toHaveBeenCalledWith(expect.stringContaining("👤 Профиль"));
    expect(ctx.reply).toHaveBeenCalledWith(expect.stringContaining("Имя: Артём"));
    expect(ctx.reply).toHaveBeenCalledWith(expect.stringContaining("Фамилия: Иванов"));
    expect(ctx.reply).toHaveBeenCalledWith(expect.stringContaining("Username: @artem_dev"));

    const result = await db.select().from(users).where(eq(users.telegramId, 123456));
    expect(result.length).toBe(1);
    expect(result[0]).toMatchObject({
      telegramId: 123456,
      firstName: "Артём",
      lastName: "Иванов",
      languageCode: "ru",
      phoneNumber: "+375291112233",
      isBot: false,
      username: "artem_dev",
    });
  });

  it('deletes a user and responds correctly',async()=>{
    const ctx=createMockCtx();

    await controller.create(ctx);
    await controller.delete(ctx);

    expect(ctx.reply).toHaveBeenCalledWith("🗑️ Профиль удалён.");

    const result = await db.select().from(users).where(eq(users.telegramId,123456));
    expect(result.length).toBe(0);

  });

  it('updates user fields',async()=>{
    const ctx=createMockCtx();
    const updates: UpdateUserDto["updates"] = {
      firstName: "Artiomsin",
      username: "artemdev__sin",
      languageCode: "en",
    };
    await controller.create(ctx);
    await controller.update(ctx,updates)
    expect(ctx.reply).toHaveBeenCalledWith("✅ Профиль обновлён.");
    const result = await db.select().from(users).where(eq(users.telegramId, 123456));
    expect(result.length).toBe(1);
    expect (result[0]).toMatchObject({ 
      firstName: "Artiomsin",
      username: "artemdev__sin",
      languageCode: "en",});
  });

  it('detects that the user is registered', async () => {
    const ctx = createMockCtx();
    await controller.create(ctx);

    await controller.check(ctx);

    expect(ctx.reply).toHaveBeenCalledWith("✅ Вы зарегистрированы.");
  });
  
  it('detects that the user is not registered', async () => {
    const ctx = createMockCtx({ id: 777 });

    await controller.check(ctx);

    expect(ctx.reply).toHaveBeenCalledWith("❌ Вы не зарегистрированы.");
  });

  it('returns a list of users for an admin', async () => {
    const ctx=createMockCtx({id: 999}, { text: "/users_list 1" });
    await service.create({

      telegramId: 999,
      firstName: "Admin",
      lastName: "Root",
      username: "admin_user",
      isBot: false,
      languageCode: "ru",
      phoneNumber: "+375291100000",
      role: "admin",
    });

    await service.create({
      telegramId: 111,
      firstName: "UserOne",
      lastName: "Test",
      username: "user_one",
      isBot: false,
      languageCode: "ru",
      role: "user",
      phoneNumber: null,
    });

    await service.create({
      telegramId: 112,
      firstName: "UserTwo",
      lastName: "Test",
      username: "user_two",
      isBot: false,
      languageCode: "ru",
      phoneNumber: "+375291122222",
      role: "user",
    });

    await controller.list(ctx);

    expect(ctx.reply).toHaveBeenCalledWith(expect.stringContaining("📋 Страница 1:"));
    expect(ctx.reply).toHaveBeenCalledWith(expect.stringContaining("👤 UserOne (@user_one)"));
    expect(ctx.reply).toHaveBeenCalledWith(expect.stringContaining("👤 UserTwo (@user_two)"));

    
  });

  it('sorts users by username (asc) for admin', async () => {
    const ctx = createMockCtx({ id: 999 }, { text: "/users_sort username asc" });


    await service.create({
      telegramId: 113,
      firstName: "Beta",
      lastName: "User",
      username: "beta_user",
      isBot: false,
      languageCode: "ru",
      phoneNumber: "+375291111111",
      role: "user",
    });

    await service.create({
      telegramId: 114,
      firstName: "Alpha",
      lastName: "User",
      username: "alpha_user",
      isBot: false,
      languageCode: "ru",
      phoneNumber: "+375291122222",
      role: "user",
    });

    await controller.sortedList(ctx);

    expect(ctx.reply).toHaveBeenCalledWith(expect.stringContaining("📋 Сортировка по username (asc):"));
    expect(ctx.reply).toHaveBeenCalledWith(expect.stringContaining("👤 Alpha User | alpha_user | user"));
    expect(ctx.reply).toHaveBeenCalledWith(expect.stringContaining("👤 Beta User | beta_user | user"));
  });



});
