"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_guard_1 = require("./jwt.guard");
const typeorm_1 = require("@nestjs/typeorm");
const user_schema_1 = require("../schema/user.schema");
const typeorm_2 = require("typeorm");
const options_1 = require("../common/options");
const common_messages_1 = require("../common/common-messages");
jwt_guard_1.AuthService;
let ProviderGuard = class ProviderGuard {
    constructor(authService, UserModel) {
        this.authService = authService;
        this.UserModel = UserModel;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const token = request.headers['x-access-token'];
        if (!token)
            throw new common_1.UnauthorizedException('Token not found');
        const user = await this.authService.verifyToken(token);
        let user_data = await this.UserModel.findOne({ where: { id: user.id, user_role: options_1.OptionsMessage.USER_ROLE.PROVIDER } });
        if (!user_data)
            throw new common_1.UnauthorizedException({ message: common_messages_1.CommonMessages.PERMISSION_ERR, statusCode: 401 });
        if (!user_data.is_active) {
            throw new common_1.UnauthorizedException({ message: common_messages_1.CommonMessages.user_inactive, statusCode: 401 });
        }
        request.user = user;
        return true;
    }
};
ProviderGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(user_schema_1.User)),
    __metadata("design:paramtypes", [jwt_guard_1.AuthService,
        typeorm_2.Repository])
], ProviderGuard);
exports.ProviderGuard = ProviderGuard;
//# sourceMappingURL=provider.guard.js.map