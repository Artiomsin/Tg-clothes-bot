import { describe, it, expect, beforeEach, vi } from "vitest";
import { Context } from "grammy";
import { UsersTelegramController } from "../../endpoints/users/users.controller";

// 🧪 Мок UsersService
const mockUsersService = {
  create: vi.fn(),
  getByTelegramId: vi.fn(),
  delete: vi.fn(),
  update: vi.fn(),
  List: vi.fn(),
  exists: vi.fn(),
  isAdmin: vi.fn(),
  getSortedUsers: vi.fn(),
};

// 🧪 Мок-контекст Telegram
const createMockContext = (text: string): Context => {
  return {
    from: {
      id: 123,
      username: "testuser",
      first_name: "Test",
      is_bot: false,
    },
    message: {
      message_id: 1,
      date: Math.floor(Date.now() / 1000),
      chat: {
        id: 123,
        type: "private",
        username: "testuser",
      },
      text,
    },
    reply: vi.fn(),
  } as unknown as Context;
};

// 🧪 Утилита для вывода ответов
const printReplies = (ctx: Context, label: string) => {
  const calls = (ctx.reply as any).mock.calls;
  console.log(`\n💬 ${label}`);
  for (const [text] of calls) {
    console.log(`🗨️ ${text}`);
  }
};

let controller: UsersTelegramController;

beforeEach(() => {
  controller = new UsersTelegramController(mockUsersService as any);
  vi.clearAllMocks();
});

describe("UsersTelegramController (sortedList)", () => {
  it("should reply if telegramId is missing", async () => {
    const ctx = {
  ...createMockContext("/users_sort"),
  from: undefined,
} as unknown as Context;


    await controller.sortedList(ctx);
    printReplies(ctx, "sortedList (no telegramId)");

    expect((ctx.reply as any).mock.calls[0][0]).toBe("❌ Не удалось определить пользователя.");
  });

  it("should reply if user is not admin", async () => {
    mockUsersService.isAdmin.mockResolvedValue(false);
    const ctx = createMockContext("/users_sort");

    await controller.sortedList(ctx);
    printReplies(ctx, "sortedList (not admin)");

    expect((ctx.reply as any).mock.calls[0][0]).toBe("⛔ У вас нет прав для сортировки пользователей.");
  });

  it("should reply if no field is provided", async () => {
    mockUsersService.isAdmin.mockResolvedValue(true);
    const ctx = createMockContext("/users_sort");

    await controller.sortedList(ctx);
    printReplies(ctx, "sortedList (no field)");

    expect((ctx.reply as any).mock.calls[0][0]).toBe("❌ Укажите поле сортировки. Пример: /users_sort createdAt desc");
  });

  it("should reply if field is invalid", async () => {
    mockUsersService.isAdmin.mockResolvedValue(true);
    const ctx = createMockContext("/users_sort age asc");

    await controller.sortedList(ctx);
    printReplies(ctx, "sortedList (invalid field)");

    expect((ctx.reply as any).mock.calls[0][0]).toContain("❌ Недопустимое поле сортировки");
  });

  it("should reply if no users found", async () => {
    mockUsersService.isAdmin.mockResolvedValue(true);
    mockUsersService.getSortedUsers.mockResolvedValue([]);
    const ctx = createMockContext("/users_sort firstName asc");

    await controller.sortedList(ctx);
    printReplies(ctx, "sortedList (no users)");

    expect((ctx.reply as any).mock.calls[0][0]).toBe("📭 Нет пользователей.");
  });

  it("should sort by firstName", async () => {
  mockUsersService.isAdmin.mockResolvedValue(true);
  mockUsersService.getSortedUsers.mockResolvedValue([
    { firstName: "Alice", username: "alice", role: "admin" },
    { firstName: "Bob", username: "bob", role: "user" },
    { firstName: "Charlie", username: "charlie", role: "user" },
  ]);
  const ctx = createMockContext("/users_sort firstName asc");

  await controller.sortedList(ctx);
  printReplies(ctx, "sortedList (firstName)");

  const replyText = (ctx.reply as any).mock.calls[0][0];
  const names = replyText
    .split("\n")
    .filter((line: string) => line.startsWith("👤"))
    .map((line: string) => line.split(" ")[1]);
  expect(names).toEqual(["Alice", "Bob", "Charlie"]);
});


it("should sort by createdAt", async () => {
  mockUsersService.isAdmin.mockResolvedValue(true);
  mockUsersService.getSortedUsers.mockResolvedValue([
    {
      firstName: "Charlie",
      createdAt: new Date("2022-12-01"),
      username: "charlie",
      role: "user",
    },
    {
      firstName: "Alice",
      createdAt: new Date("2023-01-01"),
      username: "alice",
      role: "admin",
    },
    {
      firstName: "Bob",
      createdAt: new Date("2023-03-01"),
      username: "bob",
      role: "user",
    },
  ]);
  const ctx = createMockContext("/users_sort createdAt desc");

  await controller.sortedList(ctx);
  printReplies(ctx, "sortedList (createdAt)");

  const replyText = (ctx.reply as any).mock.calls[0][0];
  const names = replyText
    .split("\n")
    .filter((line: string) => line.startsWith("👤"))
    .map((line: string) => line.split(" ")[1]);
  expect(names).toEqual(["Charlie", "Alice", "Bob"]);
});

});
