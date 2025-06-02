import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { VERIFICATION } from 'src/common/constants/verification.constants';
import { UserStatus } from 'src/common/enums/user-status.enums';
import { RefreshToken } from 'src/database/entities/refresh-token.entity';
import type { User } from 'src/database/entities/user.entity';
import type { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import type { IVerificationService } from '../verification/interfaces/verification-service.interface';
import type { LoginResponseDto } from './dto/login-response.dto';
import type { LoginDto } from './dto/login.dto';
import type { RegisterResponseDto } from './dto/register-response.dto';
import type { RegisterDto } from './dto/register.dto';
import type { IAuthService } from './interfaces/auth-service.interface';

interface RefreshTokenPayload {
    sub: number;
    iat: number;
    exp: number;
}

@Injectable()
export class AuthService implements IAuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        @InjectRepository(RefreshToken)
        private readonly refreshTokenRepository: Repository<RefreshToken>,
        @Inject(VERIFICATION.REGISTER_TOKEN)
        private readonly registerVerificationService: IVerificationService,
        @Inject(VERIFICATION.RECOVER_PASSWORD_TOKEN)
        private readonly recoverPasswordVerificationService: IVerificationService,
    ) {}

    async login(dto: LoginDto): Promise<LoginResponseDto> {
        const user = await this.usersService.findByPhoneNumber(dto.phoneNumber);
        if (!user || !(await bcrypt.compare(dto.password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const accessToken = await this.jwtService.signAsync(
            { sub: user.id, phoneNumber: user.phoneNumber, role: user.role },
            { expiresIn: '15m', secret: process.env.JWT_SECRET },
        );

        const refreshToken = await this.jwtService.signAsync(
            { sub: user.id },
            { expiresIn: '7d', secret: process.env.JWT_REFRESH_SECRET },
        );

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.refreshTokenRepository.save(
            this.refreshTokenRepository.create({
                token: refreshToken,
                user,
                expiresAt,
            }),
        );
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                phoneNumber: user.phoneNumber,
                name: user.name,
                role: user.role,
            },
        };
    }

    async refreshToken(refreshToken: string): Promise<LoginResponseDto> {
        let payload: RefreshTokenPayload;
        try {
            payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const token = await this.refreshTokenRepository.findOne({
            where: { token: refreshToken, user: { id: payload.sub } },
            relations: ['user'],
        });
        if (!token || token.expiresAt < new Date()) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        await this.refreshTokenRepository.delete({ id: token.id });

        const newAccessToken = await this.jwtService.signAsync(
            {
                sub: token.user.id,
                phoneNumber: token.user.phoneNumber,
                role: token.user.role,
            },
            { expiresIn: '15m', secret: process.env.JWT_SECRET },
        );

        const newRefreshToken = await this.jwtService.signAsync(
            { sub: token.user.id },
            { expiresIn: '7d', secret: process.env.JWT_REFRESH_SECRET },
        );
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.refreshTokenRepository.save(
            this.refreshTokenRepository.create({
                token: newRefreshToken,
                user: token.user,
                expiresAt,
            }),
        );

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            user: {
                id: token.user.id,
                phoneNumber: token.user.phoneNumber,
                name: token.user.name,
                role: token.user.role,
            },
        };
    }

    async register(dto: RegisterDto): Promise<RegisterResponseDto> {
        const existingUser = await this.usersService.findByPhoneNumber(dto.phoneNumber);
        if (existingUser) {
            throw new UnauthorizedException('User already exists');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await this.usersService.create({
            ...dto,
            password: hashedPassword,
        });

        await this.registerVerificationService.sendVerificationCode(user.phoneNumber);

        return {
            id: user.id,
            phoneNumber: user.phoneNumber,
            name: user.name,
            lastName: user.lastName,
            role: user.role,
        };
    }

    async getUserIfRefreshTokenMatches(refreshToken: string, userId: number): Promise<User | null> {
        const token = await this.refreshTokenRepository.findOne({
            where: { token: refreshToken, user: { id: userId } },
            relations: ['user'],
        });

        if (!token || token.expiresAt < new Date()) {
            return null;
        }
        return token.user;
    }

    async verifyRegisterCode(phoneNumber: string, code: string): Promise<void> {
        await this.registerVerificationService.verifyCode(phoneNumber, code);
        const user = await this.usersService.findByPhoneNumber(phoneNumber);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        user.status = UserStatus.PENDING_APPROVAL;
        await this.usersService.update(user.id, user);
    }
    async sendResetPasswordCode(phoneNumber: string): Promise<void> {
        const user = await this.usersService.findByPhoneNumber(phoneNumber);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        await this.recoverPasswordVerificationService.sendVerificationCode(phoneNumber);
    }

    async verifyResetPasswordCode(phoneNumber: string, code: string): Promise<unknown> {
        await this.recoverPasswordVerificationService.verifyCode(phoneNumber, code);
        const user = await this.usersService.findByPhoneNumber(phoneNumber);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        const payload = {
            sub: user.id,
            scope: 'reset_password' as const,
        };
        const token = await this.jwtService.signAsync(payload, {
            expiresIn: '15m',
            secret: process.env.JWT_RESET_SECRET,
        });
        return {
            token,
            message: 'Password reset token generated successfully',
        };
    }

    async resetPassword(phoneNumber: string, newPassword: string): Promise<void> {
        const user = await this.usersService.findByPhoneNumber(phoneNumber);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        user.password = await bcrypt.hash(newPassword, 10);
        user.passwordUpdatedAt = new Date();
        await this.usersService.update(user.id, user);
    }
}
