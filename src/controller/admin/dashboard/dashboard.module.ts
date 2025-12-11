import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { User } from 'src/schema/user.schema';
import { AuthService } from 'src/authGuard/jwt.guard';
import { UserGuard } from 'src/authGuard/user.guard';
import { Product } from 'src/schema/product.schema';
import { ProductRequest } from 'src/schema/product_request.schema';
import { Category } from 'src/schema/category.schema';
import { CategoryRequest } from 'src/schema/category_request.schema';
import { User_document } from 'src/schema/user_document.schema';
import { Wallet_req } from 'src/schema/wallet_req.schema';
import { Rating } from 'src/schema/rating.schema';
import { Report } from 'src/schema/report.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Product, Report,ProductRequest, Category,Rating, CategoryRequest, User_document, Wallet_req]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [DashboardController],
  providers: [DashboardService, AuthService, UserGuard],
  exports: [DashboardService],
})
export class DashboardModule { }
