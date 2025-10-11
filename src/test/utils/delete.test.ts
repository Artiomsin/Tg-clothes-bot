import { describe, it, expect, beforeEach } from "vitest";
import { UsersTelegramController } from "../../endpoints/users/users.controller";
import { createMockContext, mockUsersService, printReplies } from "./utils";

let controller: UsersTelegramController;

beforeEach(() => {
  controller = new UsersTelegramController(mockUsersService as any);
});

describe("UsersTelegramController (delete)", () => {
  it("should reply when profile is deleted", async () => {
    mockUsersService.delete.mockResolvedValue(undefined);
    const ctx = createMockContext();

    await controller.delete(ctx);
    printReplies(ctx, "delete (success)");

    expect((ctx.reply as any).mock.calls[0][0]).toBe("🗑️ Профиль удалён.");
  });

  it("should reply if telegramId is missing", async () => {
    const ctx = createMockContext({ from: undefined });

    await controller.delete(ctx);
    printReplies(ctx, "delete (no telegramId)");

    expect((ctx.reply as any).mock.calls[0][0]).toBe("❌ Не удалось определить пользователя.");
  });

  it("should reply if user not found", async () => {
    mockUsersService.delete.mockRejectedValue(new Error("User not found"));
    const ctx = createMockContext();

    await controller.delete(ctx);
    printReplies(ctx, "delete (not found)");

    expect((ctx.reply as any).mock.calls[0][0]).toBe("❌ Профиль не найден.");
  });
});
