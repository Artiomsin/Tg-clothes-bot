import { SortableUserFields } from "../../shared/types/SortableUserFields";

export type CreateUserDto = {
  telegramId: number;
  username?: string | null;
  firstName: string;
  lastName: string | null;
  languageCode: string | null;
  phoneNumber?: string | null;
  isBot: boolean;
  role?: string;
};

export type UpdateUserDto = {
  telegramId: number;
  updates: {
    username?: string | null;
    firstName?: string;
    lastName?: string | null;
    languageCode?: string | null;
    phoneNumber?: string | null;
    role?: string;
  };
};

export type DeleteUserDto = {
  telegramId: number;
};

export type GetUserByTelegramIdDto = {
  telegramId: number;
};

export type GetUserByUsernameDto = {
  username: string;
};

export type ListUsersPaginatedDto = {
  page: number;
  pageSize: number;
};

export type CheckUserExistsDto = {
  telegramId: number;
};

export type SortUsersDto = {
  field: SortableUserFields;
  direction?: 'asc' | 'desc';
};

