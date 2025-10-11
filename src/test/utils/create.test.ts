import { describe, it, expect, beforeEach } from "vitest";
import { UsersTelegramController } from "../../endpoints/users/users.controller";
import { createMockContext, mockUsersService, printReplies } from "./utils";

let controller: UsersTelegramController;

beforeEach(() => {
  controller = new UsersTelegramController(mockUsersService as any);
});

describe("UsersTelegramController (create)", () => {
  
    it("should reply with welcome message", async () => {
        mockUsersService.create.mockResolvedValue(undefined);
        mockUsersService.getByTelegramId.mockResolvedValue({
            telegramId: 123,
            firstName: "Test",
            lastName: "User",
            username: "testuser",
        });

        const ctx = createMockContext();
        await controller.create(ctx);
        printReplies(ctx, "create");

        expect((ctx.reply as any).mock.calls[0][0]).toBe("👋 Добро пожаловать! Профиль создан.");
        expect((ctx.reply as any).mock.calls[1][0]).toContain("👤 Профиль:");
    });


    it("should reply if user already exists", async () => {
        mockUsersService.create.mockRejectedValue(new Error("already exists"));
        const ctx = createMockContext();

        await controller.create(ctx);
        printReplies(ctx, "create (exists)");

        expect((ctx.reply as any).mock.calls[0][0]).toBe("✅ Вы уже зарегистрированы.");
    });

    it("should reply if telegramId is missing", async () => {
        const ctx = createMockContext({ from: undefined });

        await controller.create(ctx);
        printReplies(ctx, "create (no telegramId)");

        expect((ctx.reply as any).mock.calls[0][0]).toBe("❌ Не удалось определить пользователя.");
    });
});
