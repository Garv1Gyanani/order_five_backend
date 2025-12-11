import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProviderModule } from './provider/provider.module';
import { CustomerModule } from './customer/customer.module';
import { Required_docModule } from './required_doc/required_doc.module';
import { UserModule } from '../provider/provider/provider.module';
import { SettingModule } from './setting/setting.module';
import { AuthModule } from '../auth/auth.module';
import { WalletManagementModule } from './wallet_management/wallet_management.module';
import { CategoryModule } from './category_management/category_management.module';
import { CategoryRequestModule } from './category_request/category_request.module';
import { ProductRequestModule } from './product_request/product_request.module';
import { ProductModule } from './product_management/product_management.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { OrderAdminModule } from './order_management/order_management.module';
import { NotificationAdminModule } from './notification/notification.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { ReportModule } from './report/report.module';

@Module({
  imports: [
    DashboardModule,
    ProductModule,
    ProductRequestModule,
    CategoryRequestModule,
    CategoryModule,
    WalletManagementModule,
    ProviderModule,
    CustomerModule,
    Required_docModule,
    UserModule,
    AuthModule,
    SettingModule,
    OrderAdminModule,
    NotificationAdminModule,
    SubscriptionModule,
    ReportModule
  ],
  controllers: [],
  providers: [],
})
export class AdminmainModule { }
