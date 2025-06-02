export class ErrorDto {
    code: string;
    message: string;
    details: Record<string, unknown> | null;
}
