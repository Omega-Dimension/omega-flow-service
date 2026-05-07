import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const isProduction = config.get<string>('NODE_ENV') === 'production';

    return {
      type: 'postgres',
      host: config.get<string>('DB_HOST'),
      port: config.get<number>('DB_PORT'),
      database: config.get<string>('DB_NAME'),
      username: config.get<string>('DB_USERNAME'),
      password: config.get<string>('DB_PASSWORD'),
      autoLoadEntities: true,
      synchronize:
        !isProduction && config.get<string>('DB_SYNCHRONIZE') === 'true',
      migrationsRun: false,
      migrations: [__dirname + '/../db/migrations/*{.ts,.js}'],
      logging: isProduction
        ? ['error', 'warn']
        : ['error', 'warn', 'schema', 'query'],
      logger: isProduction ? 'file' : 'debug',
      
      extra: {
        min: 5,
        max: 10,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        maxUses: 10000,
      },
    };
  },
};
