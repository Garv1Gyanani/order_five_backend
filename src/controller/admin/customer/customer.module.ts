import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { User } from 'src/schema/user.schema';
import { AuthService } from 'src/authGuard/jwt.guard';
import { UserGuard } from 'src/authGuard/user.guard';
import { Rating } from 'src/schema/rating.schema';
import { Order } from 'src/schema/order.schema';
import { Wallet_req } from 'src/schema/wallet_req.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([User,Order ,Wallet_req,Rating]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [CustomerController],
  providers: [CustomerService, AuthService, UserGuard],
  exports: [CustomerService],
})
export class CustomerModule { }
