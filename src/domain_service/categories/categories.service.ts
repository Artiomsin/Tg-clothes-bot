import { CreateCategoryDto, DeleteCategoryDto, GetCategoryByIdDto, UpdateCategoryDto } from "../../endpoints/categories/category.dto";
import { Category } from "../../infrastructure/db/models/Categories";
import { ICategoriesRepository } from "../../infrastructure/db/repositories/categories/ICategoriesRepository";

export class CategoriesService{

    constructor(private readonly categoriesRepo: ICategoriesRepository){}

    async create(dto: CreateCategoryDto): Promise<Category> {
        console.log(`[CategoryService] Creating category "${dto.name}"`);
        const created = await this.categoriesRepo.create(dto.name);
        console.log(`[CategoryService] Category "${dto.name}" created with id ${created.id}`);
        return created;
    }

    async update(dto: UpdateCategoryDto): Promise<Category> {
        console.log(`[CategoryService] Updating category ${dto.id}`);
        const existing = await this.categoriesRepo.getById(dto.id);
        if (!existing) throw new Error(`Category ${dto.id} not found`);
        const updated = await this.categoriesRepo.update(dto.id, dto.name);
        console.log(`[CategoryService] Category ${dto.id} updated`);
        return updated;
    }

    async delete(dto: DeleteCategoryDto): Promise<void> {
        console.log(`[CategoryService] Deleting category ${dto.id}`);
        const existing = await this.categoriesRepo.getById(dto.id);
        if (!existing) throw new Error(`Category ${dto.id} not found`);
        await this.categoriesRepo.delete(dto.id);
        console.log(`[CategoryService] Category ${dto.id} deleted`);
    }

    async getById(dto: GetCategoryByIdDto): Promise<Category | null> {
        console.log(`[CategoryService] Fetching category ${dto.id}`);
        return await this.categoriesRepo.getById(dto.id);
    }

    async getAll(): Promise<Category[]> {
        console.log(`[CategoryService] Fetching all categories`);
        return await this.categoriesRepo.getAll();
    }


  
}