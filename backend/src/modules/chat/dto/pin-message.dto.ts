import { IsBoolean, IsString } from "class-validator";

/**
 * DTO for pinning/unpinning messages via WebSocket events
 * Only users with ADMIN role can perform this action
 */
export class PinMessageDto {
    @IsString()
    messageId: string;

    @IsBoolean()
    pinned: boolean;
}