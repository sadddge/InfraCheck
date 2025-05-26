import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    exports: [TypeOrmModule, UsersService],
    controllers: [UsersController],
    providers: [UsersService],
})
export class UsersModule {}
