"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminmainModule = void 0;
const common_1 = require("@nestjs/common");
const provider_module_1 = require("./provider/provider.module");
const customer_module_1 = require("./customer/customer.module");
const required_doc_module_1 = require("./required_doc/required_doc.module");
const provider_module_2 = require("../provider/provider/provider.module");
const setting_module_1 = require("./setting/setting.module");
const auth_module_1 = require("../auth/auth.module");
const wallet_management_module_1 = require("./wallet_management/wallet_management.module");
const category_management_module_1 = require("./category_management/category_management.module");
const category_request_module_1 = require("./category_request/category_request.module");
const product_request_module_1 = require("./product_request/product_request.module");
const product_management_module_1 = require("./product_management/product_management.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const order_management_module_1 = require("./order_management/order_management.module");
const notification_module_1 = require("./notification/notification.module");
const subscription_module_1 = require("./subscription/subscription.module");
const report_module_1 = require("./report/report.module");
let AdminmainModule = class AdminmainModule {
};
AdminmainModule = __decorate([
    (0, common_1.Module)({
        imports: [
            dashboard_module_1.DashboardModule,
            product_management_module_1.ProductModule,
            product_request_module_1.ProductRequestModule,
            category_request_module_1.CategoryRequestModule,
            category_management_module_1.CategoryModule,
            wallet_management_module_1.WalletManagementModule,
            provider_module_1.ProviderModule,
            customer_module_1.CustomerModule,
            required_doc_module_1.Required_docModule,
            provider_module_2.UserModule,
            auth_module_1.AuthModule,
            setting_module_1.SettingModule,
            order_management_module_1.OrderAdminModule,
            notification_module_1.NotificationAdminModule,
            subscription_module_1.SubscriptionModule,
            report_module_1.ReportModule
        ],
        controllers: [],
        providers: [],
    })
], AdminmainModule);
exports.AdminmainModule = AdminmainModule;
//# sourceMappingURL=admin_main.module.js.map