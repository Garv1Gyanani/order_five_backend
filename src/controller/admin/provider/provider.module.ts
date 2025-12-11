import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProviderService } from './provider.service';
import { ProviderController } from './provider.controller';
import { User } from 'src/schema/user.schema';
import { AuthService } from 'src/authGuard/jwt.guard';
import { UserGuard } from 'src/authGuard/user.guard';
import { User_document } from 'src/schema/user_document.schema';
import { Setting } from 'src/schema/setting.schema';
import { EmailTemplate } from 'src/schema/email_templates.schema';
import { Required_doc } from 'src/schema/required_doc.schema';
import { Notification } from 'src/schema/notification.schema';
import { Rating } from 'src/schema/rating.schema';
import { Subscription } from 'src/schema/subscription.schema';
import { Order } from 'src/schema/order.schema';
import { Wallet_req } from 'src/schema/wallet_req.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([User,Wallet_req,Order,Required_doc,Subscription, Rating,User_document, Notification,Setting, EmailTemplate]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [ProviderController],
  providers: [ProviderService, AuthService, UserGuard],
  exports: [ProviderService],
})
export class ProviderModule { }
