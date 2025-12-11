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
exports.UserLocationController = void 0;
const common_1 = require("@nestjs/common");
const user_location_service_1 = require("./user_location.service");
const common_messages_1 = require("../../../common/common-messages");
const provider_guard_1 = require("../../../authGuard/provider.guard");
let UserLocationController = class UserLocationController {
    constructor(UserLocationService) {
        this.UserLocationService = UserLocationService;
    }
    async getList(req) {
        try {
            let user_id = req.user.id;
            const data = await this.UserLocationService.getAllPages(user_id);
            return { status: true, message: common_messages_1.CommonMessages.GET_LIST("Address"), data: data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getbyId(id) {
        try {
            const data = await this.UserLocationService.getData(id);
            return { status: true, message: common_messages_1.CommonMessages.GET_DATA("Address"), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async createProfile(createDto, req) {
        try {
            let user_id = req.user.id;
            createDto.user_id = user_id;
            const data = await this.UserLocationService.createOrUpdateData(createDto, user_id);
            return { status: true, message: 'user location added successfull', data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
};
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserLocationController.prototype, "getList", null);
__decorate([
    (0, common_1.Get)('get/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserLocationController.prototype, "getbyId", null);
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserLocationController.prototype, "createProfile", null);
UserLocationController = __decorate([
    (0, common_1.Controller)('/provider/userlocation'),
    (0, common_1.UseGuards)(provider_guard_1.ProviderGuard),
    __metadata("design:paramtypes", [user_location_service_1.UserLocationService])
], UserLocationController);
exports.UserLocationController = UserLocationController;
//# sourceMappingURL=user_location.controller.js.map