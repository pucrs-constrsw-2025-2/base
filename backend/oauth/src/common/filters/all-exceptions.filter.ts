import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    // Build standardized error body
    const body: any = {
      error_code: status === HttpStatus.INTERNAL_SERVER_ERROR ? '500' : String(status),
      error_description: (exception as any)?.message || (exception as any)?.response || 'Internal server error',
      error_source: 'OAuthAPI',
      error_stack: [],
    };

    // attach stack if available
    if (exception instanceof Error) {
      body.error_stack = exception.stack?.split('\n').map((s) => s.trim()) || [];
      console.error('Unhandled exception:', exception.stack);
    } else {
      console.error('Unhandled exception (non-Error):', exception);
    }

    // log request info
    try {
      console.error('Request:', request.method, request.url, 'Headers:', request.headers);
    } catch (e) {
      console.error('Request logging failed', e);
    }

    response.status(status).json(body);
  }
}
