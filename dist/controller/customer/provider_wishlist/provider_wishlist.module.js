"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductWishListModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const user_schema_1 = require("../../../schema/user.schema");
const jwt_guard_1 = require("../../../authGuard/jwt.guard");
const user_guard_1 = require("../../../authGuard/user.guard");
const product_schema_1 = require("../../../schema/product.schema");
const product_request_schema_1 = require("../../../schema/product_request.schema");
const provider_wishlist_service_1 = require("./provider_wishlist.service");
const provider_wishlist_controller_1 = require("./provider_wishlist.controller");
const wishlist_schema_1 = require("../../../schema/wishlist.schema");
const rating_schema_1 = require("../../../schema/rating.schema");
const report_schema_1 = require("../../../schema/report.schema");
const notification_schema_1 = require("../../../schema/notification.schema");
let ProductWishListModule = class ProductWishListModule {
};
ProductWishListModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_schema_1.User, product_schema_1.Product, product_request_schema_1.ProductRequest, notification_schema_1.Notification, wishlist_schema_1.ProviderWishlist, rating_schema_1.Rating, report_schema_1.Report]),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_SECRET'),
                    signOptions: { expiresIn: '7d' },
                }),
            }),
        ],
        controllers: [provider_wishlist_controller_1.ProductWishController],
        providers: [provider_wishlist_service_1.ProductWishListService, jwt_guard_1.AuthService, user_guard_1.UserGuard],
        exports: [provider_wishlist_service_1.ProductWishListService],
    })
], ProductWishListModule);
exports.ProductWishListModule = ProductWishListModule;
//# sourceMappingURL=provider_wishlist.module.js.map