export class UserDto {
    id: number;
    phoneNumber: string;
    name: string;
    lastName: string;
    role: string;
    status: string;
    createdAt: Date;
    passwordUpdatedAt: Date | null;
}
