import { Module } from '@nestjs/common';
import { UserModule } from './provider/provider.module';
import { AuthModule } from '../auth/auth.module';
import { WalletRequestModule } from './wallet_request/wallet_request.module';
import { CategoryRequestModule } from './category_request/category_request.module';
import { ProductRequestModule } from './product_request/product_request.module';
import { Product } from 'src/schema/product.schema';
import { Required_docModule } from './required_doc/required_doc.module';
import { SettingModule } from './setting/setting.module';
import { CategoryModule } from './category_management/category_management.module';
import { ProductModule } from './product_management/product_management.module';
import { UserProviderLocationModule } from './user_location/user_location.module';
import { OrderProviderModule } from './order_management/order_management.module';
import { SubscriptionProviderModule } from './subscription/subscription.module';

@Module({
  imports: [
    ProductModule,
    CategoryModule,
    Required_docModule,
    Product,
    SettingModule,
    ProductRequestModule,
    CategoryRequestModule,
    WalletRequestModule,
    UserProviderLocationModule,
    UserModule,
    AuthModule,
    UserProviderLocationModule,
    OrderProviderModule,
    SubscriptionProviderModule
  ],
  controllers: [],
  providers: [],
})
export class ProvidermainModule { }
