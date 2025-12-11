import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { User } from 'src/schema/user.schema';
import { AuthService } from 'src/authGuard/jwt.guard';
import { UserGuard } from 'src/authGuard/user.guard';
import { Product } from 'src/schema/product.schema';
import { ProductRequest } from 'src/schema/product_request.schema';
import { User_location } from 'src/schema/user_location.schema';
import { Rating } from 'src/schema/rating.schema';
import { ProviderWishlist } from 'src/schema/wishlist.schema';
import { Notification } from 'src/schema/notification.schema';
import { Wallet_req } from 'src/schema/wallet_req.schema';
import { Setting } from 'src/schema/setting.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Product, User_location,ProductRequest,Rating,ProviderWishlist,Notification,Wallet_req,Setting]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, AuthService, UserGuard],
  exports: [NotificationService],
})
export class NotificationAdminModule { }
