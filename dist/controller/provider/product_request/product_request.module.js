"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRequestModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const product_request_service_1 = require("./product_request.service");
const product_request_controller_1 = require("./product_request.controller");
const user_schema_1 = require("../../../schema/user.schema");
const jwt_guard_1 = require("../../../authGuard/jwt.guard");
const user_guard_1 = require("../../../authGuard/user.guard");
const product_schema_1 = require("../../../schema/product.schema");
const product_request_schema_1 = require("../../../schema/product_request.schema");
const category_request_schema_1 = require("../../../schema/category_request.schema");
const category_schema_1 = require("../../../schema/category.schema");
const setting_schema_1 = require("../../../schema/setting.schema");
const email_templates_schema_1 = require("../../../schema/email_templates.schema");
let ProductRequestModule = class ProductRequestModule {
};
ProductRequestModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_schema_1.User, category_schema_1.Category, category_request_schema_1.CategoryRequest, product_request_schema_1.ProductRequest, product_schema_1.Product, setting_schema_1.Setting, email_templates_schema_1.EmailTemplate]),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_SECRET'),
                    signOptions: { expiresIn: '7d' },
                }),
            }),
        ],
        controllers: [product_request_controller_1.ProductRequestController],
        providers: [product_request_service_1.ProductRequestService, jwt_guard_1.AuthService, user_guard_1.UserGuard],
        exports: [product_request_service_1.ProductRequestService],
    })
], ProductRequestModule);
exports.ProductRequestModule = ProductRequestModule;
//# sourceMappingURL=product_request.module.js.map