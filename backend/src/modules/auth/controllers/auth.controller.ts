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
import { LoginResponseDto } from '../dto/login-response.dto';
import { LoginDto } from '../dto/login.dto';
import { RecoverPasswordDto } from '../dto/recover-password.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { RegisterResponseDto } from '../dto/register-response.dto';
import { RegisterDto } from '../dto/register.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { VerifyRecoverPasswordDto } from '../dto/verify-recover-password.dto';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { JwtResetGuard } from '../guards/jwt-reset.guard';
import { AUTH_SERVICE, type IAuthService } from '../interfaces/auth-service.interface';
import {
    type IPasswordRecoveryService,
    PASSWORD_RECOVERY_SERVICE,
} from '../interfaces/password-recovery-service.interface';
import {
    type IUserRegistrationService,
    USER_REGISTRATION_SERVICE,
} from '../interfaces/user-registration-service.interface';

/**
 * Authentication controller handling user registration, login, password recovery, and token management.
 * Provides RESTful endpoints for all authentication-related operations.
 *
 * Exposes authentication endpoints including:
 * - User registration with SMS verification
 * - Login with JWT token generation
 * - Token refresh functionality
 * - Password recovery via SMS
 * - Password reset with verification
 * - User logout with token invalidation
 *
 * @example
 * ```typescript
 * // All endpoints are prefixed with /api/v1/auth
 * POST /api/v1/auth/login
 * POST /api/v1/auth/register
 * POST /api/v1/auth/refresh
 * ```
 */
@Controller({
    path: 'auth',
    version: '1',
})
export class AuthController {
    /**
     * Creates a new AuthController instance.
     *
     * @param authService Authentication service for handling business logic
     */
    constructor(
        @Inject(AUTH_SERVICE)
        private readonly authService: IAuthService,
        @Inject(USER_REGISTRATION_SERVICE)
        private readonly userRegistrationService: IUserRegistrationService,
        @Inject(PASSWORD_RECOVERY_SERVICE)
        private readonly passwordRecoveryService: IPasswordRecoveryService,
    ) {}

    /**
     * Authenticates a user with phone number and password.
     * Returns access and refresh tokens upon successful authentication.
     *
     * @async
     * @param {LoginDto} dto - Login credentials containing phone number and password
     * @returns {Promise<LoginResponseDto>} Authentication response with tokens and user data
     *
     * @example
     * ```typescript
     * POST /api/v1/auth/login
     * {
     *   "phoneNumber": "+1234567890",
     *   "password": "userPassword123"
     * }
     * ```
     */
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
        description: 'Invalid credentials provided (AUTH001).',
    })
    async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
        return await this.authService.login(dto);
    }

    /**
     * @async
     * @method refresh
     * @description Refreshes an expired access token using a valid refresh token.
     * Validates the refresh token and issues new access and refresh tokens,
     * maintaining user session continuity without requiring re-authentication.
     * @param {RefreshTokenDto} dto - Refresh token data transfer object
     * @param {string} dto.refreshToken - Valid refresh token for token renewal
     * @returns {Promise<LoginResponseDto>} New authentication tokens and user data
     * @throws {AppException} When refresh token is invalid, expired, or revoked (AUTH007)
     *
     * @example
     * ```typescript
     * POST /api/v1/auth/refresh
     * {
     *   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     * }
     *
     * // Response:
     * {
     *   "accessToken": "new-access-token",
     *   "refreshToken": "new-refresh-token",
     *   "user": { ... }
     * }
     * ```
     */
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
        description: 'Invalid or expired refresh token (AUTH007).',
    })
    async refresh(@Body() dto: RefreshTokenDto, @Request() req): Promise<LoginResponseDto> {
        return await this.authService.refreshToken(dto.refreshToken, req.user.id);
    }

    /**
     * @async
     * @method register
     * @description Registers a new user account with phone number verification.
     * Creates a new user account and sends an SMS verification code to the
     * provided phone number. Account activation requires code verification.
     *
     * @param {RegisterDto} dto - Registration data containing user information
     * @param {string} dto.phoneNumber - User's phone number for verification
     * @param {string} dto.password - User's chosen password
     * @param {string} dto.username - User's chosen username
     * @returns {Promise<RegisterResponseDto>} Registration response with verification instructions
     * @throws {AppException} When phone number is already registered or validation fails (USR002, VAL001-VAL003)
     *
     * @example
     * ```typescript
     * POST /api/v1/auth/register
     * {
     *   "phoneNumber": "+1234567890",
     *   "password": "securePassword123",
     *   "username": "johndoe"
     * }
     *
     * // Response:
     * {
     *   "message": "Registration successful. Please verify your phone number.",
     *   "phoneNumber": "+1234567890"
     * }
     * ```
     */
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
        description: 'Invalid registration data provided (VAL001-VAL003, USR002).',
    })
    async register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
        return await this.userRegistrationService.register(dto);
    }

    /**
     * @async
     * @method verifyRegisterCode
     * @description Verifies the SMS code sent during user registration.
     * Validates the verification code and activates the user account,
     * completing the registration process and enabling user login.
     *
     * @param {string} phoneNumber - Phone number that received the verification code     * @param {string} code - 6-digit verification code from SMS
     * @returns {Promise<void>} Resolves when verification is successful
     * @throws {AppException} When verification code is invalid or expired (VER002)
     *
     * @example
     * ```typescript
     * POST /api/v1/auth/verify-register-code?phoneNumber=+1234567890&code=123456
     *
     * // Success: User account activated and ready for login
     * // Error: "Invalid or expired registration code"
     * ```
     */
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
        description: 'Invalid or expired registration code (VER002).',
    })
    @ApiInternalServerErrorResponse({
        description: 'An error occurred while verifying the registration code (VER001, SRV001).',
    })
    async verifyRegisterCode(
        @Query('phoneNumber') phoneNumber: string,
        @Query('code') code: string,
    ): Promise<void> {
        await this.userRegistrationService.verifyRegisterCode(phoneNumber, code);
    }

    /**
     * @async
     * @method sendResetPasswordCode
     * @description Initiates password recovery by sending an SMS verification code.
     * Validates the phone number exists in the system and sends a verification
     * code that can be used to reset the user's password.
     *
     * @param {RecoverPasswordDto} recoverPasswordDto - Password recovery request data     * @param {string} recoverPasswordDto.phoneNumber - Registered phone number for password reset
     * @returns {Promise<string>} Success message confirming code was sent
     * @throws {AppException} When phone number is not registered (USR001, VER003)
     *
     * @example
     * ```typescript
     * POST /api/v1/auth/recover-password
     * {
     *   "phoneNumber": "+1234567890"
     * }
     *
     * // Response: "Password recovery code sent successfully."
     * // SMS sent to phone with 6-digit verification code
     * ```
     */
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
        description: 'Invalid phone number provided (VER003).',
    })
    async sendResetPasswordCode(@Body() recoverPasswordDto: RecoverPasswordDto): Promise<string> {
        await this.passwordRecoveryService.sendResetPasswordCode(recoverPasswordDto.phoneNumber);
        return 'Password recovery code sent successfully.';
    }

    /**
     * @async
     * @method verifyRecoverPasswordCode
     * @description Verifies the password recovery code and generates a reset token.
     * Validates the SMS verification code and returns a temporary token that
     * can be used to reset the user's password within a limited time window.
     *
     * @param {VerifyRecoverPasswordDto} verifyRecoverPasswordDto - Recovery verification data
     * @param {string} verifyRecoverPasswordDto.phoneNumber - Phone number for password reset     * @param {string} verifyRecoverPasswordDto.code - Verification code from SMS
     * @returns {Promise<unknown>} Reset token for password change authorization
     * @throws {AppException} When verification code is invalid or expired (AUTH009)
     *
     * @example
     * ```typescript
     * POST /api/v1/auth/verify-recover-password
     * {
     *   "phoneNumber": "+1234567890",
     *   "code": "123456"
     * }
     *
     * // Response:
     * {
     *   "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     * }
     * ```
     */
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
        description: 'Invalid or expired recovery code (AUTH009).',
    })
    async verifyRecoverPasswordCode(
        @Body() verifyRecoverPasswordDto: VerifyRecoverPasswordDto,
    ): Promise<unknown> {
        return await this.passwordRecoveryService.generateResetPasswordToken(
            verifyRecoverPasswordDto.phoneNumber,
            verifyRecoverPasswordDto.code,
        );
    }

    /**
     * @async
     * @method resetPassword
     * @description Resets user password using a valid reset token.
     * Changes the user's password after validating the reset token obtained
     * from the password recovery flow. Invalidates all existing tokens.
     *
     * @param {ResetPasswordDto} resetPasswordDto - Password reset data
     * @param {string} resetPasswordDto.token - Valid reset token from recovery flow
     * @param {string} resetPasswordDto.newPassword - New password for the user account
     * @param {Request} req - Express request object populated by JwtResetGuard
     * @param {Object} req.user - User information extracted from reset token     * @param {number} req.user.id - User ID for password reset
     * @returns {Promise<string>} Success message confirming password reset
     * @throws {AppException} When reset token is invalid or password validation fails (AUTH008, VAL001-VAL003)
     *
     * @example
     * ```typescript
     * POST /api/v1/auth/reset-password
     * {
     *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     *   "newPassword": "newSecurePassword123"
     * }
     *
     * // Response: "Password reset successfully."
     * // User can now login with new password
     * ```
     */
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
        description: 'Invalid token or password provided (AUTH008, VAL001-VAL003).',
    })
    async resetPassword(
        @Body() resetPasswordDto: ResetPasswordDto,
        @Request() req,
    ): Promise<string> {
        return await this.passwordRecoveryService.resetPassword(
            req.user.id,
            resetPasswordDto.newPassword,
        );
    }
}
