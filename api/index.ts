import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app-setup';

let handler: ((request: Request, response: Response) => void) | undefined;

async function bootstrap() {
  const adapter = new ExpressAdapter();
  const app = await NestFactory.create(AppModule, adapter);
  configureApp(app);
  await app.init();
  return adapter.getInstance();
}

export default async function vercelHandler(
  request: Request,
  response: Response,
): Promise<void> {
  handler ??= await bootstrap();
  if (!handler) throw new Error('Vercel handler gagal diinisialisasi');
  handler(request, response);
}
