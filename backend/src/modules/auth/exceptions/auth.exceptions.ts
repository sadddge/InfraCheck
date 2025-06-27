import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidCredentialsException extends HttpException {
    constructor() {
        super('Invalid credentials provided', HttpStatus.UNAUTHORIZED);
    }
}

export class AccountNotActiveException extends HttpException {
    constructor() {
        super(
            'Account is not active. Please wait for activation or contact support.',
            HttpStatus.FORBIDDEN,
        );
    }
}

export class InvalidAccessTokenException extends HttpException {
    constructor() {
        super('Invalid access token', HttpStatus.UNAUTHORIZED);
    }
}

export class InvalidRefreshTokenException extends HttpException {
    constructor() {
        super('Invalid refresh token', HttpStatus.UNAUTHORIZED);
    }
}

export class InvalidResetTokenException extends HttpException {
    constructor() {
        super('Invalid reset token', HttpStatus.UNAUTHORIZED);
    }
}

export class InvalidPasswordResetCodeException extends HttpException {
    constructor() {
        super('Invalid password reset code', HttpStatus.BAD_REQUEST);
    }
}

export class InvalidVerificationCodeException extends HttpException {
    constructor() {
        super('Invalid verification code', HttpStatus.BAD_REQUEST);
    }
}
