import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { User } from 'src/schema/user.schema';
import { AuthService } from 'src/authGuard/jwt.guard';
import { UserGuard } from 'src/authGuard/user.guard';
import { Report } from 'src/schema/report.schema';
import { Wallet_req } from 'src/schema/wallet_req.schema';
 
@Module({
  imports: [
    TypeOrmModule.forFeature([User,Wallet_req,Report]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [ReportController],
  providers: [ReportService, AuthService, UserGuard],
  exports: [ReportService],
})
export class ReportModule { }
