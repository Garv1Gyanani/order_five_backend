import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { User } from 'src/schema/user.schema';
import { AuthService } from 'src/authGuard/jwt.guard';
import { UserGuard } from 'src/authGuard/user.guard';
import { User_document } from 'src/schema/user_document.schema';
import { Category } from 'src/schema/category.schema';
import { Product } from 'src/schema/product.schema';
import { ProductRequest } from 'src/schema/product_request.schema';
import { Rating } from 'src/schema/rating.schema';
import { Notification } from 'src/schema/notification.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, User_document, Category,Notification, Product, ProductRequest,Rating]),
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
