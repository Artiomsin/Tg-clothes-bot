export type CreateCategoryDto = {
  name: string;
};

export type UpdateCategoryDto = {
  id: number;
  name: string;
};

export type DeleteCategoryDto = {
  id: number;
};

export type GetCategoryByIdDto = {
  id: number;
};