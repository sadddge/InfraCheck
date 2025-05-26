import {
    Body,
    Controller,
    HttpCode,
    Post,
    UseGuards,
    Request,
    Inject,
    Param,
    Query,
} from '@nestjs/common';
import { AUTH_SERVICE, IAuthService } from './interfaces/auth-service.interface';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterResponseDto } from './dto/register-reponse.dto';
import { Public } from 'src/common/decorators/public.decorator';
import {
    IVerificationService,
    VERIFICATION_SERVICE,
} from './interfaces/verification-service.interface';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
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
        @Inject(VERIFICATION_SERVICE)
        private readonly verificationService: IVerificationService,
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

    @Post('refresh')
    @HttpCode(200)
    @Public()
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

    @Post('logout')
    @HttpCode(204)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'User logout',
        description: 'This endpoint allows users to log out, invalidating their refresh token.',
    })
    @ApiOkResponse({
        description: 'User logged out successfully.',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized access, user not logged in.',
    })
    async logout(@Request() req) {
        return this.authService.logout(parseInt(req.user.id));
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
    @Post('send-verification-code')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Send verification code',
        description: "This endpoint sends a verification code to the user's phone number.",
    })
    @ApiQuery({
        name: 'phoneNumber',
        description: 'User phone number in E.164 format (e.g., +56912345678)',
        required: true,
        type: String,
    })
    @ApiOkResponse({
        description: 'Verification code sent successfully.',
    })
    @ApiBadRequestResponse({
        description: 'Invalid phone number format.',
    })
    @ApiInternalServerErrorResponse({
        description: 'Internal server error while sending verification code.',
    })
    async sendVerificationCode(@Query('phoneNumber') phoneNumber: string) {
        return this.verificationService.sendVerificationCode(phoneNumber);
    }

    @Public()
    @Post('verify-code')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Verify code',
        description: "This endpoint verifies the code sent to the user's phone number.",
    })
    @ApiQuery({
        name: 'phoneNumber',
        description: 'User phone number in E.164 format (e.g., +56912345678)',
        required: true,
        type: String,
    })
    @ApiQuery({
        name: 'code',
        description: "Verification code sent to the user's phone number",
        required: true,
        type: String,
    })
    @ApiOkResponse({
        description: 'Verification successful.',
    })
    @ApiBadRequestResponse({
        description: 'Invalid phone number or code.',
    })
    async verifyCode(@Query('phoneNumber') phoneNumber: string, @Query('code') code: string) {
        await this.verificationService.verifyCode(phoneNumber, code);
        return 'Verification successful';
    }
}
