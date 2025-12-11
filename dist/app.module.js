"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const db_config_1 = require("./config/db.config");
const admin_module_1 = require("./controller/admin.module");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const user_guard_1 = require("./authGuard/user.guard");
const jwt_guard_1 = require("./authGuard/jwt.guard");
const jwt_1 = require("@nestjs/jwt");
const provider_guard_1 = require("./authGuard/provider.guard");
const admin_guard_1 = require("./authGuard/admin.guard");
const user_schema_1 = require("./schema/user.schema");
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'uploads'),
                serveRoot: '/uploads',
            }),
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forFeature([user_schema_1.User]),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: db_config_1.getDatabaseConfig,
            }),
            admin_module_1.AdminModule,
        ],
        controllers: [],
        providers: [
            user_guard_1.UserGuard,
            provider_guard_1.ProviderGuard,
            admin_guard_1.AdminGuard,
            jwt_guard_1.AuthService,
            jwt_1.JwtService,
        ],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map