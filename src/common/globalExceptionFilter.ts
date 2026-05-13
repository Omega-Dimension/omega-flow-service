import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Get HTTP request/response context
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Default server error response
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';

    // Handle NestJS HTTP exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const res = exception.getResponse() as any;

      // Support validation array messages
      message = Array.isArray(res?.message)
        ? res.message.join(', ')
        : res?.message || exception.message;

      code = res?.code || 'HTTP_ERROR';
    }

    // Standardized API error response
    response.status(status).json({
      success: false,
      path: request.url,
      timestamp: new Date().toISOString(),
      message,
      code,
    });
  }
}
