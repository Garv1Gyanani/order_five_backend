import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserService } from './provider.service';
import { UserController } from './provider.controller';
import { User } from 'src/schema/user.schema';
import { AuthService } from 'src/authGuard/jwt.guard';
import { UserGuard } from 'src/authGuard/user.guard';
import { User_document } from 'src/schema/user_document.schema';
import { Report } from 'src/schema/report.schema';
import { Rating } from 'src/schema/rating.schema';
import { Notification } from 'src/schema/notification.schema';
import { Subscription } from 'src/schema/subscription.schema';
import { ProductRequest } from 'src/schema/product_request.schema';
import { Product } from 'src/schema/product.schema';
import { Wallet_req } from 'src/schema/wallet_req.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([User,User_document,Product ,Wallet_req,ProductRequest,Report,Subscription ,Notification, Rating]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [UserController],
  providers: [UserService, AuthService, UserGuard],
  exports: [UserService],
})
export class UserModule { }
