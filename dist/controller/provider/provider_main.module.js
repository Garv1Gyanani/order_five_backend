"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProvidermainModule = void 0;
const common_1 = require("@nestjs/common");
const provider_module_1 = require("./provider/provider.module");
const auth_module_1 = require("../auth/auth.module");
const wallet_request_module_1 = require("./wallet_request/wallet_request.module");
const category_request_module_1 = require("./category_request/category_request.module");
const product_request_module_1 = require("./product_request/product_request.module");
const product_schema_1 = require("../../schema/product.schema");
const required_doc_module_1 = require("./required_doc/required_doc.module");
const setting_module_1 = require("./setting/setting.module");
const category_management_module_1 = require("./category_management/category_management.module");
const product_management_module_1 = require("./product_management/product_management.module");
const user_location_module_1 = require("./user_location/user_location.module");
const order_management_module_1 = require("./order_management/order_management.module");
const subscription_module_1 = require("./subscription/subscription.module");
let ProvidermainModule = class ProvidermainModule {
};
ProvidermainModule = __decorate([
    (0, common_1.Module)({
        imports: [
            product_management_module_1.ProductModule,
            category_management_module_1.CategoryModule,
            required_doc_module_1.Required_docModule,
            product_schema_1.Product,
            setting_module_1.SettingModule,
            product_request_module_1.ProductRequestModule,
            category_request_module_1.CategoryRequestModule,
            wallet_request_module_1.WalletRequestModule,
            user_location_module_1.UserProviderLocationModule,
            provider_module_1.UserModule,
            auth_module_1.AuthModule,
            user_location_module_1.UserProviderLocationModule,
            order_management_module_1.OrderProviderModule,
            subscription_module_1.SubscriptionProviderModule
        ],
        controllers: [],
        providers: [],
    })
], ProvidermainModule);
exports.ProvidermainModule = ProvidermainModule;
//# sourceMappingURL=provider_main.module.js.map