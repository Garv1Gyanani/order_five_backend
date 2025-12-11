"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderAdminModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const order_management_service_1 = require("./order_management.service");
const order_management_controller_1 = require("./order_management.controller");
const user_schema_1 = require("../../../schema/user.schema");
const jwt_guard_1 = require("../../../authGuard/jwt.guard");
const user_guard_1 = require("../../../authGuard/user.guard");
const product_schema_1 = require("../../../schema/product.schema");
const product_request_schema_1 = require("../../../schema/product_request.schema");
const user_location_schema_1 = require("../../../schema/user_location.schema");
const rating_schema_1 = require("../../../schema/rating.schema");
const wishlist_schema_1 = require("../../../schema/wishlist.schema");
const order_schema_1 = require("../../../schema/order.schema");
const wallet_req_schema_1 = require("../../../schema/wallet_req.schema");
const setting_schema_1 = require("../../../schema/setting.schema");
const report_schema_1 = require("../../../schema/report.schema");
let OrderAdminModule = class OrderAdminModule {
};
OrderAdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_schema_1.User, product_schema_1.Product, report_schema_1.Report, user_location_schema_1.User_location, product_request_schema_1.ProductRequest, rating_schema_1.Rating, wishlist_schema_1.ProviderWishlist, order_schema_1.Order, wallet_req_schema_1.Wallet_req, setting_schema_1.Setting]),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_SECRET'),
                    signOptions: { expiresIn: '7d' },
                }),
            }),
        ],
        controllers: [order_management_controller_1.OrderController],
        providers: [order_management_service_1.OrderService, jwt_guard_1.AuthService, user_guard_1.UserGuard],
        exports: [order_management_service_1.OrderService],
    })
], OrderAdminModule);
exports.OrderAdminModule = OrderAdminModule;
//# sourceMappingURL=order_management.module.js.map