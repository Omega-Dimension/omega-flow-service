import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { json, urlencoded } from 'express';
import { GlobalExceptionFilter } from './common/globalExceptionFilter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  /**
   * Create NestJS application instance
   * ---------------------------------------------------
   * Initializes the root application module and starts
   * the dependency injection container.
   */
  const app = await NestFactory.create(AppModule);

  /**
   * Access environment configuration service
   * ---------------------------------------------------
   * Used to retrieve values from .env or config files.
   * Example:
   * - PORT
   * - JSON_SIZE_LIMIT
   */
  const configService = app.get<ConfigService>(ConfigService);

  /**
   * Enable Cross-Origin Resource Sharing (CORS)
   * ---------------------------------------------------
   * Allows frontend applications from different origins
   * to communicate with this backend API.
   *
   * Use Cases:
   * - React frontend → NestJS backend
   * - Mobile app → API server
   * - Third-party integrations
   */
  app.enableCors({
    origin: '*',
    methods: 'GET,PUT,POST,DELETE,PATCH',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  /**
   * Configure JSON request body size limit
   * ---------------------------------------------------
   * Prevents oversized payload attacks and controls
   * maximum incoming JSON body size.
   *
   * Example:
   * - File upload metadata
   * - Large form submissions
   */
  app.use(
    json({
      limit: configService.get<string>('JSON_SIZE_LIMIT'),
    }),
  );

  /**
   * Configure URL-encoded request body parser
   * ---------------------------------------------------
   * Parses form-data submissions from HTML forms
   * or traditional application/x-www-form-urlencoded requests.
   *
   * extended: true
   * -> Allows nested object parsing.
   */
  app.use(
    urlencoded({
      extended: true,
      limit: configService.get<string>('JSON_SIZE_LIMIT'),
    }),
  );

  /**
   * Global Validation Pipe
   * ---------------------------------------------------
   * Automatically validates incoming DTO data.
   *
   * whitelist: true
   * -> Removes properties not defined in DTO.
   *
   * transform: true
   * -> Automatically transforms payload types.
   * Example:
   *   "1" -> 1
   *
   * Use Cases:
   * - Input validation
   * - Secure API payload handling
   * - Cleaner controller logic
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  /**
   * Global Exception Filter
   * ---------------------------------------------------
   * Centralized error handling layer for the entire app.
   *
   * Responsibilities:
   * - Standardize API error responses
   * - Catch unexpected exceptions
   * - Improve debugging/logging
   * - Prevent leaking internal server details
   */
  app.useGlobalFilters(new GlobalExceptionFilter());

  /**
   * Start HTTP server
   * ---------------------------------------------------
   * Launches the application on configured port.
   *
   * Default:
   * - 3000 if PORT is not provided
   */
  await app.listen(configService.get<number>('PORT') ?? 4000);

  /**
   * Application startup log
   * ---------------------------------------------------
   * Useful for monitoring and deployment verification.
   */
  console.log(
    `🚀 Server running on port ${configService.get<number>('PORT') ?? 4000}`,
  );
}

/**
 * Application Bootstrap Entry Point
 * ---------------------------------------------------
 * Executes the main startup function.
 */
bootstrap();