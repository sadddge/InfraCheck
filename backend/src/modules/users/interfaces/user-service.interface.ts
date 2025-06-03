import { User } from 'src/database/entities/user.entity';
import { RegisterDto } from 'src/modules/auth/dto/register.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserDto } from '../dto/user.dto';

export const USER_SERVICE = 'USER_SERVICE';

export interface IUserService {
    findAll(): Promise<UserDto[]>;
    findById(id: number): Promise<UserDto>;
    findByPhoneNumber(phoneNumber: string): Promise<UserDto>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<UserDto>;
    registerNeighbor(user: RegisterDto): Promise<UserDto>;
    createAdmin(user: RegisterDto): Promise<UserDto>;
    remove(id: number): Promise<void>;
    findByIdWithPassword(id: number): Promise<User>;
    findByPhoneNumberWithPassword(phoneNumber: string): Promise<User>;
}
