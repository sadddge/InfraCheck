interface UserData {
  id: number;
  phoneNumber: string;
  name: string;
  role: string;
}

export class LoginResponseDto {
    accessToken: string;
    refreshToken: string;
    user: UserData;
    
    constructor(accessToken: string, refreshToken: string, user: UserData) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.user = user;
    }
}