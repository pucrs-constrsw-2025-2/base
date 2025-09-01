import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { bootstrap } from './bootstrap';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

jest.mock('@nestjs/core');

describe('bootstrap', () => {
  afterEach(() => {
    delete process.env.PORT;
  });

  it('should create a Nest application and listen on port 3000', async () => {
    const mockApp = {
      listen: jest.fn(),
      useGlobalFilters: jest.fn(),
    };
    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);

    await bootstrap();

    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
    expect(mockApp.useGlobalFilters).toHaveBeenCalledWith(expect.any(HttpExceptionFilter));
    expect(mockApp.listen).toHaveBeenCalledWith(3000);
  });

  it('should listen on specified port from environment variable', async () => {
    process.env.PORT = '8080';
    const mockApp = {
      listen: jest.fn(),
      useGlobalFilters: jest.fn(),
    };
    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);

    await bootstrap();

    expect(mockApp.listen).toHaveBeenCalledWith('8080');
  });
});