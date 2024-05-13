import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { LoggingMiddleware } from './middleware/logging.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  // Provides enhanced logging for BAD_REQUEST errors and
  // returns errors in a consistent format to the caller
  app.useGlobalFilters(new HttpExceptionFilter());

  // Logs request metadata (e.g., method, URL, timestamp) at INFO level
  // When the environment variable DEBUG_LOG === true, it also logs query string and POST data.
  app.use(new LoggingMiddleware().use);

  // Configure CORS using ConfigService
  const configService = app.get(ConfigService);
  app.enableCors({
    origin: configService.get('ALLOWED_ORIGINS'),
  });

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
