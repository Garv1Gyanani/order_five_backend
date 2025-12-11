"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const provider_service_1 = require("./provider.service");
const provider_controller_1 = require("./provider.controller");
const user_schema_1 = require("../../../schema/user.schema");
const jwt_guard_1 = require("../../../authGuard/jwt.guard");
const user_guard_1 = require("../../../authGuard/user.guard");
const user_document_schema_1 = require("../../../schema/user_document.schema");
const report_schema_1 = require("../../../schema/report.schema");
const rating_schema_1 = require("../../../schema/rating.schema");
const notification_schema_1 = require("../../../schema/notification.schema");
const subscription_schema_1 = require("../../../schema/subscription.schema");
const product_request_schema_1 = require("../../../schema/product_request.schema");
const product_schema_1 = require("../../../schema/product.schema");
const wallet_req_schema_1 = require("../../../schema/wallet_req.schema");
let UserModule = class UserModule {
};
UserModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_schema_1.User, user_document_schema_1.User_document, product_schema_1.Product, wallet_req_schema_1.Wallet_req, product_request_schema_1.ProductRequest, report_schema_1.Report, subscription_schema_1.Subscription, notification_schema_1.Notification, rating_schema_1.Rating]),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_SECRET'),
                    signOptions: { expiresIn: '7d' },
                }),
            }),
        ],
        controllers: [provider_controller_1.UserController],
        providers: [provider_service_1.UserService, jwt_guard_1.AuthService, user_guard_1.UserGuard],
        exports: [provider_service_1.UserService],
    })
], UserModule);
exports.UserModule = UserModule;
//# sourceMappingURL=provider.module.js.map