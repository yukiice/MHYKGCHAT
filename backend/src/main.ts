import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { writeFileSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Agent Platform API')
    .setDescription('自定义 Agent 平台后端 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // 导出 Swagger JSON 文件
  writeFileSync('./swagger.json', JSON.stringify(document, null, 2));
  console.log('Swagger JSON exported to ./swagger.json');

  await app.listen(process.env.PORT || 3000);
  console.log(`Application is running on: http://localhost:${process.env.PORT || 3000}/docs`);
  console.log(`Swagger JSON: http://localhost:${process.env.PORT || 3000}/docs-json`);
}

bootstrap();
