import { Body, Controller, HttpCode, Post, UseGuards, Request, Inject, BadRequestException } from '@nestjs/common';
import { AUTH_SERVICE, IAuthService } from './interfaces/auth-service.interface';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterResponseDto } from './dto/register-reponse.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { IVerificationService, VERIFICATION_SERVICE } from './interfaces/verification-service.interface';

@Controller({
    path: 'auth',
    version: '1',
})
export class AuthController {
    constructor(
        @Inject(AUTH_SERVICE)
        private readonly authService: IAuthService,
        @Inject(VERIFICATION_SERVICE)
        private readonly verificationService: IVerificationService
    ) {}

    @Public()
    @Post('login')
    @HttpCode(200)
    async login(@Body() dto: LoginDto) : Promise<LoginResponseDto> {
        return this.authService.login(dto);
    }

    @Post('refresh')
    @HttpCode(200)
    @UseGuards(JwtRefreshGuard)
    async refresh(@Body() dto: RefreshTokenDto) {
        return this.authService.refreshToken(dto.refreshToken);
    }
    @Post('logout')
    @HttpCode(204)
    async logout(@Request() req) {
        return this.authService.logout(parseInt(req.user.id));
    }

    @Post('register')
    @HttpCode(201)
    async register(@Body() dto: RegisterDto) : Promise<RegisterResponseDto> {
        return this.authService.register(dto);
    }

    @Public()
    @Post('send-verification-code')
    @HttpCode(200)
    async sendVerificationCode(@Body('phoneNumber') phoneNumber: string) {
        return this.verificationService.sendVerificationCode(phoneNumber);
    }

    @Public()
    @Post('verify-code')
    @HttpCode(200)
    async verifyCode(@Body('phoneNumber') phoneNumber: string, @Body('code') code: string) {
        const valid = this.verificationService.verifyCode(phoneNumber, code);
        if (!valid) {
            throw new BadRequestException('Invalid verification code');
        }
        return { message: 'Verification successful' };
    }
}
