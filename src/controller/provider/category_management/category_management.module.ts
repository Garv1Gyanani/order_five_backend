import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CategoryService } from './category_management.service';
import { CategoryController } from './category_management.controller';
import { User } from 'src/schema/user.schema';
import { AuthService } from 'src/authGuard/jwt.guard';
import { UserGuard } from 'src/authGuard/user.guard';
import { Category } from 'src/schema/category.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Category]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [CategoryController],
  providers: [CategoryService, AuthService, UserGuard],
  exports: [CategoryService],
})
export class CategoryModule { }
