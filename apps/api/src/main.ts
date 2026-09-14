import type { IncomingMessage, ServerResponse } from 'http';
import express from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';

const server = express();
let ready: Promise<void> | null = null;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.setGlobalPrefix('api');
  app.enableCors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:3001' });
  await app.init();
}

function bootstrapOnce() {
  if (!ready) ready = bootstrap();
  return ready;
}

// Vercel's @vercel/node runtime imports this file and calls the default
// export per-request instead of running app.listen(), since a serverless
// function can't hold a persistent listening socket between invocations.
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await bootstrapOnce();
  server(req, res);
}

if (require.main === module) {
  bootstrapOnce().then(() => server.listen(process.env.PORT ?? 3000));
}
