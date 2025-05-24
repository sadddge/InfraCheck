import { Body, Controller, HttpCode, Post, UseGuards, Request, Inject } from '@nestjs/common';
import { AUTH_SERVICE, IAuthService } from './interfaces/auth-service.interface';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterResponseDto } from './dto/register-reponse.dto';
import { Public } from 'src/common/decorators/public.decorator';

@Controller({
    path: 'auth',
    version: '1',
})
export class AuthController {
    constructor(
        @Inject(AUTH_SERVICE)
        private readonly authService: IAuthService
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
}
