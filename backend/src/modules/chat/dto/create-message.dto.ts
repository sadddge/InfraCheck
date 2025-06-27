import { IsString } from "class-validator";

/**
 * DTO for creating new chat messages via WebSocket events
 */
export class CreateMessageDto {
    @IsString()
    content: string;
}