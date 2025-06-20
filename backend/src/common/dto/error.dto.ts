import { ErrorDetail } from '../exceptions/error-details';

/**
 * Error details without the internal 'type' discriminator field
 * Used in HTTP responses to avoid exposing internal type information
 */
type CleanErrorDetails = Omit<ErrorDetail, 'type'> | Record<string, unknown>;

export class ErrorDto {
    code: string;
    message: string;
    details: CleanErrorDetails | null;
}
