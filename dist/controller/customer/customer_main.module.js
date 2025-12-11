"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomermainModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const wallet_request_module_1 = require("./wallet_request/wallet_request.module");
const product_schema_1 = require("../../schema/product.schema");
const provider_module_1 = require("../provider/provider/provider.module");
const customer_module_1 = require("./customer/customer.module");
const user_location_module_1 = require("./user_location/user_location.module");
const setting_module_1 = require("./setting/setting.module");
const category_management_module_1 = require("./category_management/category_management.module");
const product_request_module_1 = require("./product_request/product_request.module");
const product_management_module_1 = require("./product_management/product_management.module");
const order_management_module_1 = require("./order_management/order_management.module");
const provider_wishlist_module_1 = require("./provider_wishlist/provider_wishlist.module");
let CustomermainModule = class CustomermainModule {
};
CustomermainModule = __decorate([
    (0, common_1.Module)({
        imports: [
            product_management_module_1.ProductModule,
            product_request_module_1.ProductRequestModule,
            category_management_module_1.CategoryModule,
            user_location_module_1.UserLocationModule,
            product_schema_1.Product,
            setting_module_1.SettingModule,
            wallet_request_module_1.WalletRequestModule,
            provider_module_1.UserModule,
            auth_module_1.AuthModule,
            customer_module_1.CustomerModule,
            order_management_module_1.OrderModule,
            provider_wishlist_module_1.ProductWishListModule
        ],
        controllers: [],
        providers: [],
    })
], CustomermainModule);
exports.CustomermainModule = CustomermainModule;
//# sourceMappingURL=customer_main.module.js.map