1
import { HttpExceptionFilter } from './http-exception.filter';
import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockArgumentsHost: ArgumentsHost;
  let mockResponse: Response;
  let mockRequest: Request;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    mockRequest = {
      url: '/test',
      method: 'GET',
    } as unknown as Request;
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should catch HttpException and return a formatted response', () => {
    const exception = new HttpException('Test exception', HttpStatus.BAD_REQUEST);
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: expect.any(String),
        path: '/test',
        method: 'GET',
        message: 'Test exception',
      }),
    );
  });

  it('should handle exception response as a string', () => {
    const exception = new HttpException('Custom error message', HttpStatus.NOT_FOUND);
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Custom error message',
      }),
    );
  });

  it('should handle exception response as an object', () => {
    const exception = new HttpException({ message: 'Object error message' }, HttpStatus.FORBIDDEN);
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Object error message',
      }),
    );
  });

  it('should handle exception response as an object with message array', () => {
    const exception = new HttpException({ message: ['Error 1', 'Error 2'] }, HttpStatus.UNPROCESSABLE_ENTITY);
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: ['Error 1', 'Error 2'],
      }),
    );
  });

  it('should use exception.message if response message is not available', () => {
    const exception = new HttpException({}, HttpStatus.INTERNAL_SERVER_ERROR);
    exception.message = 'Default message';
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Default message',
      }),
    );
  });
});
