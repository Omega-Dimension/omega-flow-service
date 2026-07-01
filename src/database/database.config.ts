import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],

  useFactory: (config: ConfigService) => {
    /**
     * Determine environment mode
     * Used to switch between dev and production behavior
     */
    const isProduction = config.get<string>('NODE_ENV') === 'production';

    return {
      type: 'postgres',

      // Database connection settings
      host: config.get<string>('DB_HOST'),
      port: config.get<number>('DB_PORT'),
      database: config.get<string>('DB_NAME'),
      username: config.get<string>('DB_USERNAME'),
      password: config.get<string>('DB_PASSWORD'),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      // Auto register entities
      autoLoadEntities: true,

      /**
       * Schema synchronization
       * Only enabled in development for safety
       */
      synchronize:
        !isProduction && config.get<string>('DB_SYNCHRONIZE') === 'true',

      migrationsRun: false,
      migrations: [__dirname + '/../db/migrations/*{.ts,.js}'],

      /**
       * Logging configuration
       * - Production: minimal logs
       * - Development: full debug logs
       */
      logging: isProduction
        ? ['error', 'warn']
        : ['error', 'warn', 'schema', 'query'],

      logger: isProduction ? 'file' : 'advanced-console',
      ssl: isProduction ? { rejectUnauthorized: false } : false,
      /**
       * Connection pool settings
       * Controls database performance and resource usage
       */
      extra: {
        min: 2,
        max: 10,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
      },
    };
  },
};
