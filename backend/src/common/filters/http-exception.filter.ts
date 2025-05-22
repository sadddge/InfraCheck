// src/common/filters/http-exception.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  code: string;
  message: string;
  details: any;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx      = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: number;
    let errorRes: ErrorResponse;

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

    response.status(status).json({
      success: false,
      data: null,
      error: errorRes,
    });
  }
}
