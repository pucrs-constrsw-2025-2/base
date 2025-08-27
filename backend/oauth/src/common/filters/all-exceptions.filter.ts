// all-exceptions.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let responseBody: any =
      exception instanceof HttpException ? exception.getResponse() : null;

    const error_code =
      responseBody?.['error_code'] ??
      `OA-${status.toString().padStart(3, '0')}`;

    const error_description =
      responseBody?.['error_description'] ??
      (exception instanceof Error ? exception.message : 'Unexpected error');

    const error_source =
      responseBody?.['error_source'] ?? 'OAuthAPI';

    const error_stack =
      responseBody?.['error_stack'] ??
      (exception instanceof Error ? exception.stack?.split('\n') : []);

    response.status(status).json({
      error_code,
      error_description,
      error_source,
      error_stack,
    });
  }
}
