export interface JwtResetPayload {
    sub: string;
    scope: 'reset_password';
    iat: number;
    exp: number;
}

export interface JwtPayload {
    sub: string;
    phoneNumber: string;
    role: string;
}
