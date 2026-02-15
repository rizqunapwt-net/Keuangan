import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);

  // 1. Global Prefix
  app.setGlobalPrefix('api');

  // 2. Security: CORS
  app.enableCors({
    origin: true, // In production, replace with specific domains
    credentials: true,
  });

  // 3. Global Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // 4. Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Rizquna Attendance API')
    .setDescription('Enterprise Grade Attendance System API')
    .setVersion('4.2.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 NestJS Backend running on: http://localhost:${port}/api`);
  console.log(`📖 API Documentation available at: http://localhost:${port}/docs`);
}
bootstrap();
