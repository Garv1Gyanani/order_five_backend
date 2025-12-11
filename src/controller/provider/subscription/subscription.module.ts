import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { User } from 'src/schema/user.schema';
import { AuthService } from 'src/authGuard/jwt.guard';
import { UserGuard } from 'src/authGuard/user.guard';
import { Subscription } from 'src/schema/subscription.schema';
import { SubscriptionOrder } from 'src/schema/subscription.orders.schema';
import { Wallet_req } from 'src/schema/wallet_req.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Wallet_req,Subscription,SubscriptionOrder,]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, AuthService, UserGuard],
  exports: [SubscriptionService],
})
export class SubscriptionProviderModule { }
