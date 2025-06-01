import type { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Response } from 'express';
import type { ErrorDto } from '../dto/error.dto';
import type { ResponseDto } from '../dto/response.dto';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        let status: number;
        const errorRes: ErrorDto = {
            code: 'GEN000',
            message: 'An unexpected error occurred',
            details: {
                path: request.url,
                method: request.method,
                timestamp: new Date().toISOString(),
            },
        };

        const responseDto: ResponseDto<null> = {
            success: false,
            data: null,
            error: null,
        };

        if (!(exception instanceof HttpException)) {
            const exceptionMessage: string =
                exception instanceof Error ? exception.message : String(exception);
            this.logger.error(
                `Unhandled exception: ${exceptionMessage}`,
                exception instanceof Error ? exception.stack : undefined,
            );
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            errorRes.code = 'GEN001';
            response.status(status).json(responseDto);
            return;
        }

        status = exception.getStatus();
        const responseBody = exception.getResponse();
        if (typeof responseBody === 'string') {
            errorRes.code = 'GEN002';
            errorRes.message = responseBody;
        } else {
            const body = responseBody as Partial<ErrorDto>;
            errorRes.code = body.code ?? 'GEN003';
            errorRes.message = body.message ?? 'An error occurred';
        }

        responseDto.error = errorRes;
        response.status(status).json(responseDto);
        this.logger.error(
            `HTTP Exception: ${errorRes.message} | Status: ${status} | Code: ${errorRes.code}`,
        );
    }
}
