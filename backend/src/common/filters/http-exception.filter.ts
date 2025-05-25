import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ErrorDto } from '../dto/error.dto';
import { ResponseDto } from '../dto/response.dto';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let status: number;
        let errorRes: ErrorDto;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();

            if (typeof res === 'string') {
                errorRes = {
                    code: `HTTP_${status}`,
                    message: res,
                    details: null,
                };
            } else {
                const { message, error, ...rest } = res as any;
                errorRes = {
                    code: (rest['code'] as string) || `HTTP_${status}`,
                    message: Array.isArray(message) ? message.join('; ') : message,
                    details: rest,
                };
            }
        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            errorRes = {
                code: 'SRV001',
                message: 'Internal server error',
                details: (exception as any)?.message || null,
            };
        }

        const responseDto : ResponseDto<null> = {
            success: false,
            data: null,
            error: errorRes,
        };

        response.status(status).json(responseDto);
    }
}
