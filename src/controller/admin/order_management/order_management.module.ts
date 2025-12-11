import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OrderService } from './order_management.service';
import { OrderController } from './order_management.controller';
import { User } from 'src/schema/user.schema';
import { AuthService } from 'src/authGuard/jwt.guard';
import { UserGuard } from 'src/authGuard/user.guard';
import { Product } from 'src/schema/product.schema';
import { ProductRequest } from 'src/schema/product_request.schema';
import { User_location } from 'src/schema/user_location.schema';
import { Rating } from 'src/schema/rating.schema';
import { ProviderWishlist } from 'src/schema/wishlist.schema';
import { Order } from 'src/schema/order.schema';
import { Wallet_req } from 'src/schema/wallet_req.schema';
import { Setting } from 'src/schema/setting.schema';
import { Report } from 'src/schema/report.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Product,Report, User_location,ProductRequest,Rating,ProviderWishlist,Order,Wallet_req,Setting]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [OrderController],
  providers: [OrderService, AuthService, UserGuard],
  exports: [OrderService],
})
export class OrderAdminModule { }
