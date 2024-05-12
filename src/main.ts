import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const configService = app.get(ConfigService);

  // Configure CORS using ConfigService
  app.enableCors({
    origin: configService.get('ALLOWED_ORIGINS'),
  });

  await app.listen(configService.get('HTTP_PORT') || 4000);
}

bootstrap();
