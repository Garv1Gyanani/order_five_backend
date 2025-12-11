import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserLocationService } from './user_location.service'
import { UserLocationController } from './user_location.controller';
import { User } from 'src/schema/user.schema';
import { AuthService } from 'src/authGuard/jwt.guard';
import { UserGuard } from 'src/authGuard/user.guard';
import { User_location } from 'src/schema/user_location.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([User,User_location]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [UserLocationController],
  providers: [UserLocationService, AuthService, UserGuard],
  exports: [UserLocationService],
})
export class UserLocationModule { }
