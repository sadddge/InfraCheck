import {
    Body,
    Controller,
    HttpCode,
    Inject,
    Post,
    Query,
    Request,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiOperation,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { AUTH_SERVICE, type IAuthService } from '../../common/interfaces/auth-service.interface';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';
import { RecoverPasswordDto } from './dto/recover-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyRecoverPasswordDto } from './dto/verify-recover-password.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtResetGuard } from './guards/jwt-reset.guard';

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
        return await this.authService.login(dto);
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
    async refresh(@Body() dto: RefreshTokenDto): Promise<LoginResponseDto> {
        return await this.authService.refreshToken(dto.refreshToken);
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
        return await this.authService.register(dto);
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
        await this.authService.verifyRegisterCode(phoneNumber, code);
    }

    @Public()
    @Post('recover-password')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Recover password',
        description:
            'This endpoint allows users to recover their password by sending a reset code.',
    })
    @ApiOkResponse({
        description: 'Password recovery code sent successfully.',
    })
    @ApiBadRequestResponse({
        description: 'Invalid phone number provided.',
    })
    async sendResetPasswordCode(@Body() recoverPasswordDto: RecoverPasswordDto): Promise<string> {
        await this.authService.sendResetPasswordCode(recoverPasswordDto.phoneNumber);
        return 'Password recovery code sent successfully.';
    }

    @Public()
    @Post('verify-recover-password')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Verify recover password code',
        description: 'This endpoint allows users to verify their password recovery code.',
    })
    @ApiOkResponse({
        description: 'Password recovery code verified successfully.',
    })
    @ApiBadRequestResponse({
        description: 'Invalid or expired recovery code.',
    })
    async verifyRecoverPasswordCode(
        @Body() verifyRecoverPasswordDto: VerifyRecoverPasswordDto,
    ): Promise<unknown> {
        return await this.authService.generateResetPasswordToken(
            verifyRecoverPasswordDto.phoneNumber,
            verifyRecoverPasswordDto.code,
        );
    }

    @Public()
    @UseGuards(JwtResetGuard)
    @Post('reset-password')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Reset password',
        description: 'This endpoint allows users to reset their password using a valid token.',
    })
    @ApiOkResponse({
        description: 'Password reset successfully.',
        type: String,
    })
    @ApiBadRequestResponse({
        description: 'Invalid token or password provided.',
    })
    async resetPassword(
        @Body() resetPasswordDto: ResetPasswordDto,
        @Request() req,
    ): Promise<string> {
        return await this.authService.resetPassword(req.user.id, resetPasswordDto.newPassword);
    }
}
