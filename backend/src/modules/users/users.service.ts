import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from 'src/database/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterDto } from '../auth/dto/register.dto';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async create(RegisterDto: RegisterDto) : Promise<User> {
    const user = this.userRepository.create(RegisterDto);
    return this.userRepository.save(user);
  }

  async findAll() : Promise<UserDto[]> {
    return this.userRepository.find({
      select: {
        id: true,
        name: true,
        lastName: true,
        phoneNumber: true,
        role: true
      }
    });
  }

  async findOne(id: number) : Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        id: id
      }
    });
    
  }

  async update(id: number, updateUserDto: UpdateUserDto) : Promise<User | null> {
    const result = await this.userRepository.update(id, updateUserDto);
    if (result.affected === 0) {
      return null;
    }
    return this.userRepository.findOne({
      where: {
        id: id
      }
    });
  }

  async remove(id: number) : Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return result.affected !== 0;
  }

  async findByPhoneNumber(phoneNumber: string) : Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        phoneNumber: phoneNumber
      }
    });
  }
}
