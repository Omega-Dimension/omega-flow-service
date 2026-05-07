import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);

  app.enableCors({
    origin: '*',
    methods: 'GET,PUT,POST,DELETE,PATCH',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.use(json({ limit: configService.get<string>('JSON_SIZE_LIMIT') }));
  app.use(
    urlencoded({
      extended: true,
      limit: configService.get<string>('JSON_SIZE_LIMIT'),
    }),
  );

  await app.listen(configService.get<number>('PORT') ?? 3000);
}
bootstrap();
