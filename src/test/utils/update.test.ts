import { describe, it, expect, beforeEach } from "vitest";
import { UsersTelegramController } from "../../endpoints/users/users.controller";
import { createMockContext, mockUsersService, printReplies } from "./utils";

let controller: UsersTelegramController;

beforeEach(() => {
  controller = new UsersTelegramController(mockUsersService as any);
});

describe("UsersTelegramController (update)", () => {
  it("should reply when update is successful", async () => {
    mockUsersService.update.mockResolvedValue(undefined);
    const ctx = createMockContext();

    await controller.update(ctx, { firstName: "Артёмий" });
    printReplies(ctx, "update (success)");

    expect((ctx.reply as any).mock.calls[0][0]).toBe("✅ Профиль обновлён.");
  });

  it("should reply if telegramId is missing", async () => {
    const ctx = createMockContext({ from: undefined });

    await controller.update(ctx, { firstName: "Артёмий" });
    printReplies(ctx, "update (no telegramId)");

    expect((ctx.reply as any).mock.calls[0][0]).toBe("❌ Не удалось определить пользователя.");
  });

  it("should reply if update fails", async () => {
    mockUsersService.update.mockRejectedValue(new Error("update failed"));
    const ctx = createMockContext();

    await controller.update(ctx, { firstName: "Артёмий" });
    printReplies(ctx, "update (error)");

    expect((ctx.reply as any).mock.calls[0][0]).toBe("❌ Ошибка при обновлении.");
  });

    it("should update multiple fields at once", async () => {
        mockUsersService.update.mockResolvedValue(undefined);
        const ctx = createMockContext();

        const updates = {
            firstName: "Артёмий",
            lastName: "Смирнов",
        };

        await controller.update(ctx, updates);
        printReplies(ctx, "update (multiple fields)");

        expect((ctx.reply as any).mock.calls[0][0]).toBe("✅ Профиль обновлён.");
        expect(mockUsersService.update).toHaveBeenCalledWith({
            telegramId: 123,
            updates,
        });
    });

});
