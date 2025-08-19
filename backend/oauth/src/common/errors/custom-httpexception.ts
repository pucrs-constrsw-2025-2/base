import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomHttpException extends HttpException {
  constructor(
    errorCode: string,
    description: string,
    source: string,
    statusCode: number,
    stack?: any,
  ) {
    super(
      {
        error_code: `OA-${statusCode.toString().padStart(3, '0')}`,
        error_description: description,
        error_source: source,
        error_stack: stack ? (Array.isArray(stack) ? stack : [stack]) : [],
      },
      Number(statusCode),
    );
  }
}