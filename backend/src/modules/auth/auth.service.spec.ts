import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { USER_SERVICE } from '../users/interfaces/user-service.interface';
import { VERIFICATION } from 'src/common/constants/verification.constants';
import { RefreshToken } from 'src/database/entities/refresh-token.entity';
import { Role } from 'src/common/enums/roles.enums';
import type { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
    let service: AuthService;
    let usersService: any;
    let jwtService: any;
    let repo: jest.Mocked<Repository<RefreshToken>>;

    beforeEach(async () => {
        usersService = {
            findByPhoneNumberWithPassword: jest.fn(),
            registerNeighbor: jest.fn(),
            findByPhoneNumber: jest.fn(),
            findByIdWithPassword: jest.fn(),
            update: jest.fn(),
        };
        jwtService = {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: USER_SERVICE, useValue: usersService },
                { provide: getRepositoryToken(RefreshToken), useValue: { findOne: jest.fn(), save: jest.fn(), delete: jest.fn(), create: jest.fn() } },
                { provide: VERIFICATION.REGISTER_TOKEN, useValue: { sendVerificationCode: jest.fn() } },
                { provide: VERIFICATION.RECOVER_PASSWORD_TOKEN, useValue: { verifyCode: jest.fn(), sendVerificationCode: jest.fn() } },
                { provide: JwtService, useValue: jwtService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        repo = module.get(getRepositoryToken(RefreshToken));
        process.env.JWT_SECRET = 'secret';
        process.env.JWT_REFRESH_SECRET = 'refresh';
    });

    describe('login', () => {
        it('returns tokens when credentials are valid', async () => {
            const user = { id: 1, phoneNumber: '+1', password: 'hash', name: 'n', lastName: 'l', role: Role.NEIGHBOR };
            usersService.findByPhoneNumberWithPassword.mockResolvedValueOnce(user);
            jest.spyOn(bcrypt as any, 'compare').mockResolvedValueOnce(true as any);
            jwtService.signAsync.mockResolvedValueOnce('access').mockResolvedValueOnce('refresh');
            repo.create.mockReturnValue({} as RefreshToken);
            await expect(service.login({ phoneNumber: '+1', password: 'pass' })).resolves.toEqual({
                accessToken: 'access',
                refreshToken: 'refresh',
                user: {
                    id: 1,
                    phoneNumber: '+1',
                    name: 'n',
                    lastName: 'l',
                    role: Role.NEIGHBOR,
                },
            });
        });

        it('throws UnauthorizedException when user not found', async () => {
            usersService.findByPhoneNumberWithPassword.mockRejectedValueOnce(new NotFoundException());
            await expect(service.login({ phoneNumber: '+1', password: 'p' })).rejects.toBeInstanceOf(UnauthorizedException);
        });

        it('throws UnauthorizedException when password invalid', async () => {
            const user = { id: 1, phoneNumber: '+1', password: 'hash' };
            usersService.findByPhoneNumberWithPassword.mockResolvedValueOnce(user);
            jest.spyOn(bcrypt as any, 'compare').mockResolvedValueOnce(false as any);
            await expect(service.login({ phoneNumber: '+1', password: 'p' })).rejects.toBeInstanceOf(UnauthorizedException);
        });
    });

    describe('getUserIfRefreshTokenMatches', () => {
        it('returns user when token valid', async () => {
            const user = { id: 1 } as any;
            repo.findOne.mockResolvedValueOnce({ token: 't', user, expiresAt: new Date(Date.now() + 1000) } as any);
            await expect(service.getUserIfRefreshTokenMatches('t', 1)).resolves.toBe(user);
        });

        it('returns null when token expired', async () => {
            repo.findOne.mockResolvedValueOnce({ token: 't', user: {}, expiresAt: new Date(Date.now() - 1000) } as any);
            await expect(service.getUserIfRefreshTokenMatches('t', 1)).resolves.toBeNull();
        });
    });
});
