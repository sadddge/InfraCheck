import { IsBoolean } from "class-validator";

export class TypingDto {
    @IsBoolean()
    isTyping: boolean;
}