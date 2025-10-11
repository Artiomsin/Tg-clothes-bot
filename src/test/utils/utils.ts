import { Context } from "grammy";
import { vi } from "vitest";

export const mockUsersService = {
  create: vi.fn(),
  getByTelegramId: vi.fn(),
  delete: vi.fn(),
  update: vi.fn(),
  List: vi.fn(),
  exists: vi.fn(),
  isAdmin: vi.fn(),
  getSortedUsers: vi.fn(),
};

export const createMockContext = (overrides: Partial<Context> = {}): Context => {
  const baseMessage = {
    message_id: 1,
    date: Math.floor(Date.now() / 1000),
    chat: {
      id: 123,
      type: "private",
    },
    text: "/users_sort firstName asc",
  };

  return {
    from: {
      id: 123,
      username: "testuser",
      first_name: "Test",
      last_name: "User",
      language_code: "ru",
      is_bot: false,
    },
    message: {
      ...baseMessage,
      ...(overrides.message ?? {}),
    },
    reply: vi.fn(),
    ...overrides,
  } as unknown as Context;
};

export const printReplies = (ctx: Context, label: string) => {
  const calls = (ctx.reply as any).mock.calls;
  console.log(`\n💬 ${label}`);
  for (const [text] of calls) {
    console.log(`🗨️ ${text}`);
  }
};
