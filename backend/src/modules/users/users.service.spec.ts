import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from 'src/database/entities/user.entity';
import { Role } from 'src/common/enums/roles.enums';
import { UserStatus } from 'src/common/enums/user-status.enums';
import type { Repository } from 'typeorm';

describe('UsersService', () => {
    let service: UsersService;
    let repo: jest.Mocked<Repository<User>>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                        delete: jest.fn(),
                        update: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        repo = module.get(getRepositoryToken(User));
    });

    describe('findById', () => {
        it('returns a user when found', async () => {
            const user = {
                id: 1,
                phoneNumber: '+56911111111',
                name: 'Test',
                lastName: 'User',
                role: Role.NEIGHBOR,
                status: UserStatus.ACTIVE,
                createdAt: new Date(),
                passwordUpdatedAt: null,
            } as User;
            repo.findOne.mockResolvedValueOnce(user);
            await expect(service.findById(1)).resolves.toEqual(user);
        });

        it('throws NotFoundException when not found', async () => {
            repo.findOne.mockResolvedValueOnce(null);
            await expect(service.findById(1)).rejects.toBeInstanceOf(NotFoundException);
        });
    });

    describe('registerNeighbor', () => {
        const dto = {
            phoneNumber: '+56922222222',
            password: 'pass',
            name: 'Jane',
            lastName: 'Doe',
        };

        it('creates a new user', async () => {
            repo.findOne.mockResolvedValueOnce(null);
            const created = { id: 2, ...dto } as User;
            repo.create.mockReturnValueOnce(created);
            repo.save.mockResolvedValueOnce(created);
            jest.spyOn(service, 'findById').mockResolvedValueOnce(created as any);

            await expect(service.registerNeighbor(dto)).resolves.toEqual(created);
            expect(repo.create).toHaveBeenCalledWith(dto);
            expect(repo.save).toHaveBeenCalledWith(created);
        });

        it('throws ConflictException when phone already exists', async () => {
            repo.findOne.mockResolvedValueOnce({} as User);
            await expect(service.registerNeighbor(dto)).rejects.toBeInstanceOf(ConflictException);
        });
    });

    describe('remove', () => {
        it('removes a user when deletion affected rows > 0', async () => {
            repo.delete.mockResolvedValueOnce({ affected: 1 } as any);
            await expect(service.remove(1)).resolves.toBeUndefined();
        });

        it('throws NotFoundException when delete affected 0 rows', async () => {
            repo.delete.mockResolvedValueOnce({ affected: 0 } as any);
            await expect(service.remove(1)).rejects.toBeInstanceOf(NotFoundException);
        });
    });
});
