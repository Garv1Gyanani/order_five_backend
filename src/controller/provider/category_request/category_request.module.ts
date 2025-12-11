import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CategoryRequestService } from './category_request.service';
import { CategoryRequestController } from './category_request.controller';
import { User } from 'src/schema/user.schema';
import { AuthService } from 'src/authGuard/jwt.guard';
import { UserGuard } from 'src/authGuard/user.guard';
import { CategoryRequest } from 'src/schema/category_request.schema';
import { Category } from 'src/schema/category.schema';
import { Setting } from 'src/schema/setting.schema';
import { EmailTemplate } from 'src/schema/email_templates.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, CategoryRequest, Category, Setting, EmailTemplate]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [CategoryRequestController],
  providers: [CategoryRequestService, AuthService, UserGuard],
  exports: [CategoryRequestService],
})
export class CategoryRequestModule { }
