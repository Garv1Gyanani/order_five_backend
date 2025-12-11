import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ProvidermainModule } from './provider/provider_main.module';
import { AdminmainModule } from './admin/admin_main.module';
import { CustomermainModule } from './customer/customer_main.module';

@Module({
  imports: [
    CustomermainModule,
    AdminmainModule,
    ProvidermainModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AdminModule { }
