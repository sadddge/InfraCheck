import { IsBoolean } from "class-validator";

/**
 * DTO for WebSocket typing indicator events
 * Used to broadcast when users start or stop typing in the chat
 */
export class TypingDto {
    @IsBoolean()
    isTyping: boolean;
}