import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { USER_SERVICE } from './interfaces/user-service.interface';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    exports: [TypeOrmModule, USER_SERVICE],
    controllers: [UsersController],
    providers: [
        {
            provide: USER_SERVICE,
            useClass: UsersService,
        },
    ],
})
export class UsersModule {}
