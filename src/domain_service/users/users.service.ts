import { IUsersRepository } from "../../infrastructure/db/repositories/users/IUsersRepository";
import { User } from "../../infrastructure/db/model/users.entity";
import { CheckUserExistsDto, CreateUserDto, DeleteUserDto, GetUserByTelegramIdDto, GetUserByUsernameDto, ListUsersPaginatedDto, SortUsersDto, UpdateUserDto } from "../../endpoints/users/user.dto";

export class UsersServcie {

    constructor(private readonly usersRepo: IUsersRepository){}

    async create(dto: CreateUserDto): Promise<void>{

        console.log(`[UsersService] Creating user ${dto.telegramId}`);
        const exists=await this.usersRepo.exists(dto.telegramId);
        if(exists) throw new Error('User with telegramId ${dto.telegramId} already exists');
    
            const user: User = {
                ...dto,
                createdAt: new Date(),
                role: dto.role ?? "user",
            };
            
        await this.usersRepo.create(user);
        console.log(`[UsersService] User ${dto.telegramId} created`);

    }

    async update(dto: UpdateUserDto): Promise<void>{

        console.log(`[UsersService] Updating user ${dto.telegramId}`);
        const user = await this.usersRepo.findByTelegramId(dto.telegramId);
        if(!user) throw new Error('User not found');

        await this.usersRepo.update(dto.telegramId, dto.updates);
        console.log(`[UsersService] User ${dto.telegramId} updated`);

    }

    async delete(dto: DeleteUserDto): Promise<void> {
        console.log(`[UsersService] Deleting user ${dto.telegramId}`);
        const exists = await this.usersRepo.exists(dto.telegramId);
        if (!exists)throw new Error('User not found');

        await this.usersRepo.delete(dto.telegramId);
        console.log(`[UsersService] User ${dto.telegramId} deleted`);
    }

    async getByTelegramId(dto: GetUserByTelegramIdDto): Promise<User | null> {
        console.log(`[UsersService] Fetching user by telegramId ${dto.telegramId}`);
        return await this.usersRepo.findByTelegramId(dto.telegramId);
    }

    async getByUsername(dto: GetUserByUsernameDto):Promise<User|null>{
        console.log(`[UsersService] Fetching user by username ${dto.username}`);
        return await this.usersRepo.findByUsername(dto.username);
    }

    async List(dto: ListUsersPaginatedDto): Promise<User[]>{
        console.log(`[UsersService] Listing users page=${dto.page}, pageSize=${dto.pageSize}`);
        return await this.usersRepo.findManyPaginated(dto.page, dto.pageSize);
    }

    async exists(dto: CheckUserExistsDto): Promise<boolean>{
        console.log(`[UsersService] Checking existence of user ${dto.telegramId}`);
        return await this.usersRepo.exists(dto.telegramId);
    }

    async isAdmin(telegramId: number): Promise<boolean> {
        const user = await this.usersRepo.findByTelegramId(telegramId);
        return user?.role === 'admin';
    }       

    async getSortedUsers(dto: SortUsersDto): Promise<User[]> {
        const { field, direction = 'asc' } = dto;
        return await this.usersRepo.findSorted(field, direction);
    }

}