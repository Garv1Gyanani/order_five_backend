import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Required_docService } from './required_doc.service';
import { Required_docController } from './required_doc.controller';
import { Required_doc } from 'src/schema/required_doc.schema';
import { AuthService } from 'src/authGuard/jwt.guard';
import { User } from 'src/schema/user.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Required_doc]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [Required_docController],
  providers: [Required_docService, AuthService,],
  exports: [Required_docService],
})
export class Required_docModule { }
