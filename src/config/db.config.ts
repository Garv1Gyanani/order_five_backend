import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const dbPort = Number(configService.get<string>('DB_PORT') ?? '4000');

  return {
    type: 'mysql',
    host: configService.get<string>('DB_HOST'),
    port: dbPort,
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    charset: 'utf8mb4',

    /**
     * Load ALL entities automatically
     * No need to list User, Order, Category, etc.
     */
    autoLoadEntities: true,

    /**
     * Auto-create tables from entities
     * Works perfectly with TiDB Cloud
     */
    synchronize: true,

    /**
     * TiDB Cloud requires SSL for public endpoint connections.
     * macOS already has CA bundle in /etc/ssl/cert.pem
     */
    ssl: {
      rejectUnauthorized: true,
    },

    /**
     * Optional: enable logging for debugging
     */
    logging: true,
  };
};
