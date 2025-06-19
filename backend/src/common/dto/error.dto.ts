import { ErrorDetail } from '../exceptions/error-details';

export class ErrorDto {
    code: string;
    message: string;
    details: ErrorDetail | null;
}
