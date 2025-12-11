import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WalletRequestService } from './wallet_request.service';
import { WalletRequestController } from './wallet_request.controller';
import { User } from 'src/schema/user.schema';
import { AuthService } from 'src/authGuard/jwt.guard';
import { UserGuard } from 'src/authGuard/user.guard';
import { Wallet_req } from 'src/schema/wallet_req.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Wallet_req]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [WalletRequestController],
  providers: [WalletRequestService, AuthService, UserGuard],
  exports: [WalletRequestService],
})
export class WalletRequestModule { }
