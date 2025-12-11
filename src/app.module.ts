import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from './config/db.config';
import { AdminModule } from './controller/admin.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UserGuard } from './authGuard/user.guard';
import { AuthService } from './authGuard/jwt.guard';
import { JwtService } from '@nestjs/jwt';
import { ProviderGuard } from './authGuard/provider.guard';
import { AdminGuard } from './authGuard/admin.guard';
import { User } from './schema/user.schema';   // <-- REQUIRED for UserGuard

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    ConfigModule.forRoot({
      isGlobal: true,
    }),

    /**
     * REQUIRED because your UserGuard injects:
     * @InjectRepository(User) userRepository
     *
     * Without this, Nest cannot resolve UserRepository.
     */
    TypeOrmModule.forFeature([User]),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),

    AdminModule,
  ],

  controllers: [],

  providers: [
    UserGuard,
    ProviderGuard,
    AdminGuard,
    AuthService,
    JwtService,
  ],
})
export class AppModule { }
