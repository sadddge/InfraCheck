import { Body, Controller, HttpCode, Post, UseGuards, Inject, Query } from '@nestjs/common';
import { AUTH_SERVICE, type IAuthService } from './interfaces/auth-service.interface';
import type { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import type { RefreshTokenDto } from './dto/refresh-token.dto';
import type { RegisterDto } from './dto/register.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { Public } from 'src/common/decorators/public.decorator';
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiOperation,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@Controller({
    path: 'auth',
    version: '1',
})
export class AuthController {
    constructor(
        @Inject(AUTH_SERVICE)
        private readonly authService: IAuthService,
    ) {}

    @Public()
    @Post('login')
    @HttpCode(200)
    @ApiOperation({
        summary: 'User login',
        description: 'This endpoint allows users to log in using their phone number and password.',
    })
    @ApiOkResponse({
        description: 'User logged in successfully.',
        type: LoginResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid credentials provided.',
    })
    async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
        return this.authService.login(dto);
    }

    @Public()
    @Post('refresh')
    @HttpCode(200)
    @UseGuards(JwtRefreshGuard)
    @ApiOperation({
        summary: 'Refresh access token',
        description:
            'This endpoint allows users to refresh their access token using a valid refresh token.',
    })
    @ApiOkResponse({
        description: 'Access token refreshed successfully.',
        type: LoginResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid or expired refresh token.',
    })
    async refresh(@Body() dto: RefreshTokenDto) {
        return this.authService.refreshToken(dto.refreshToken);
    }

    @Public()
    @Post('register')
    @HttpCode(201)
    @ApiOperation({
        summary: 'User registration',
        description:
            'This endpoint allows new users to register with their phone number and password.',
    })
    @ApiCreatedResponse({
        description: 'User registered successfully.',
        type: RegisterResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Invalid registration data provided.',
    })
    async register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
        return this.authService.register(dto);
    }

    @Public()
    @Post('verify-register-code')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Verify registration code',
        description: 'This endpoint allows users to verify their registration code sent via SMS.',
    })
    @ApiOkResponse({
        description: 'Registration code verified successfully.',
    })
    @ApiBadRequestResponse({
        description: 'Invalid or expired registration code.',
    })
    @ApiInternalServerErrorResponse({
        description: 'An error occurred while verifying the registration code.',
    })
    async verifyRegisterCode(
        @Query('phoneNumber') phoneNumber: string,
        @Query('code') code: string,
    ): Promise<void> {
        return this.authService.verifyRegisterCode(phoneNumber, code);
    }
}
