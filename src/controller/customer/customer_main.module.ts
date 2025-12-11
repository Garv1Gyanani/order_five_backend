import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { WalletRequestModule } from './wallet_request/wallet_request.module';
import { Product } from 'src/schema/product.schema';
import { UserModule } from '../provider/provider/provider.module';
import { CustomerModule } from './customer/customer.module';
import { UserLocationModule } from './user_location/user_location.module';
import { SettingModule } from './setting/setting.module';
import { CategoryModule } from './category_management/category_management.module';
import { ProductRequestModule } from './product_request/product_request.module';
import { ProductModule } from './product_management/product_management.module';
import { OrderModule } from './order_management/order_management.module';
import { ProductWishListModule } from './provider_wishlist/provider_wishlist.module';

@Module({
  imports: [
    ProductModule,
    ProductRequestModule,
    CategoryModule,
    UserLocationModule,
    Product,
    SettingModule,
    WalletRequestModule,
    UserModule,
    AuthModule,
    CustomerModule,
    OrderModule,
    ProductWishListModule
  ],
  controllers: [],
  providers: [],
})
export class CustomermainModule { }
