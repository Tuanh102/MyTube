import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Lấy ConfigService để đọc biến môi trường
  const configService = app.get(ConfigService);
  
  app.enableCors({
    origin: [
      configService.get<string>('CLIENT_URL') || 'http://localhost:3000',
      'http://127.0.0.1:3000'
    ],
    credentials: true,
  });

  // Serve static uploads folder
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  // Đọc cổng port từ SERVER_PORT trong file .env
  const port = configService.get<number>('SERVER_PORT') || 5000;
  
  await app.listen(port);
  console.log(`Server is running on: http://localhost:${port}`);
}
bootstrap();
