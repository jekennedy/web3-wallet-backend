import { NestFactory } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  // Register ConfigModule globally
  ConfigModule.forRoot({
    isGlobal: true,
  });
  await app.listen(3000);
}
bootstrap();
