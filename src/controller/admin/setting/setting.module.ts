import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SettingService } from './setting.service';
import { SettingController } from './setting.controller';
import { AuthService } from 'src/authGuard/jwt.guard';
import { Setting } from 'src/schema/setting.schema';
import { User } from 'src/schema/user.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Setting]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [SettingController],
  providers: [SettingService, AuthService],
  exports: [SettingService],
})
export class SettingModule { }
