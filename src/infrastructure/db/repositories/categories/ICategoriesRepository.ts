import { Category } from "../../models/Categories";

export interface ICategoriesRepository{
  create(name: string): Promise<Category>;
  update(id: number, name: string): Promise<Category>;
  delete(id: number): Promise<void>;
  getAll(): Promise<Category[]>;
  getById(id: number): Promise<Category | null>;
}