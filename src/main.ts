import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const apiPrefix = config.get<string>('API_PREFIX', 'api/v1');

  app.setGlobalPrefix(apiPrefix);
  app.use(helmet());
  const configuredOrigins = config.get<string>(
    'FRONTEND_ORIGINS',
    config.get<string>('FRONTEND_ORIGIN', 'http://localhost:5173'),
  );
  const allowedOrigins = configuredOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  for (const origin of ['http://localhost:5173', 'http://localhost:5174']) {
    if (!allowedOrigins.includes(origin)) allowedOrigins.push(origin);
  }
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  if (config.get<boolean>('SWAGGER_ENABLED', true)) {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('APAR Check API')
        .setDescription('REST API pemeriksaan dan monitoring APAR')
        .setVersion('1.0')
        .addBearerAuth()
        .build(),
    );
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(config.get<number>('PORT', 3000));
}

void bootstrap();
