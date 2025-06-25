import { IsBoolean, IsString } from "class-validator";

export class PinMessageDto {
    @IsString()
    messageId: string;
    @IsBoolean()
    pinned: boolean;
}