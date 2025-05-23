import { Injectable, UnauthorizedException } from '@nestjs/common';
import { IAuthService } from './interfaces/auth-service.interface';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from 'src/database/entities/refresh-token.entity';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login-dto';
import { LoginResponseDto } from './dto/login-response.dto';
import * as bcrypt from 'bcrypt';
import { User } from 'src/database/entities/user.entity';

@Injectable()
export class AuthService implements IAuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        @InjectRepository(RefreshToken)
        private readonly refreshTokenRepository: Repository<RefreshToken>, 
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
            this.refreshTokenRepository.create({ token: refreshToken, user, expiresAt }),
        );
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                phoneNumber: user.phoneNumber,
                name: user.name,
                role: user.role,
            }
        };
    }

    async refreshToken(refreshToken: string): Promise<any> {
        let payload: any;
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
            { sub: token.user.id, phoneNumber: token.user.phoneNumber, role: token.user.role },
            { expiresIn: '15m', secret: process.env.JWT_SECRET },
        );

        const newRefreshToken = await this.jwtService.signAsync(
            { sub: token.user.id },
            { expiresIn: '7d', secret: process.env.JWT_REFRESH_SECRET },
        );
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.refreshTokenRepository.save(
            this.refreshTokenRepository.create({ token: newRefreshToken, user: token.user, expiresAt }),
        );

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            user: {
                id: token.user.id,
                phoneNumber: token.user.phoneNumber,
                name: token.user.name,
                role: token.user.role,
            }
        }
    }

    async logout(userId: number): Promise<void> {
        await this.refreshTokenRepository.delete({ user: { id: userId } });
    }

    async getUserIfRefreshTokenMatches(resfreshToken: string, userId: number): Promise<User | null> {
        const refreshToken = await this.refreshTokenRepository.findOne({
            where: { token: resfreshToken, user: { id: userId } },
            relations: ['user'],
        });

        if (!refreshToken || refreshToken.expiresAt < new Date()) {
            return null;
        }
        return refreshToken.user;
    }
}
