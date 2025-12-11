import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
 import { User } from 'src/schema/user.schema';
import { AuthService } from 'src/authGuard/jwt.guard';
import { UserGuard } from 'src/authGuard/user.guard';
import { Product } from 'src/schema/product.schema';
import { ProductRequest } from 'src/schema/product_request.schema';
import { ProductWishListService } from './provider_wishlist.service';
import { ProductWishController } from './provider_wishlist.controller';
import { ProviderWishlist } from 'src/schema/wishlist.schema';
import { Rating } from 'src/schema/rating.schema';
import { Report } from 'src/schema/report.schema';
import { Notification } from 'src/schema/notification.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Product, ProductRequest ,Notification,ProviderWishlist,Rating,Report]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [ProductWishController],
  providers: [ProductWishListService, AuthService, UserGuard],
  exports: [ProductWishListService],
})
export class ProductWishListModule { }
