"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Required_docModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const required_doc_service_1 = require("./required_doc.service");
const required_doc_controller_1 = require("./required_doc.controller");
const required_doc_schema_1 = require("../../../schema/required_doc.schema");
const jwt_guard_1 = require("../../../authGuard/jwt.guard");
const user_schema_1 = require("../../../schema/user.schema");
let Required_docModule = class Required_docModule {
};
Required_docModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_schema_1.User, required_doc_schema_1.Required_doc]),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_SECRET'),
                    signOptions: { expiresIn: '7d' },
                }),
            }),
        ],
        controllers: [required_doc_controller_1.Required_docController],
        providers: [required_doc_service_1.Required_docService, jwt_guard_1.AuthService,],
        exports: [required_doc_service_1.Required_docService],
    })
], Required_docModule);
exports.Required_docModule = Required_docModule;
//# sourceMappingURL=required_doc.module.js.map