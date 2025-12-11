import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WalletManagementService } from './wallet_management.service';
import { WalletManagementController } from './wallet_management.controller';
import { User } from 'src/schema/user.schema';
import { AuthService } from 'src/authGuard/jwt.guard';
import { UserGuard } from 'src/authGuard/user.guard';
import { Wallet_req } from 'src/schema/wallet_req.schema';
import { Notification } from 'src/schema/notification.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Wallet_req,Notification]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [WalletManagementController],
  providers: [WalletManagementService, AuthService, UserGuard],
  exports: [WalletManagementService],
})
export class WalletManagementModule { }
