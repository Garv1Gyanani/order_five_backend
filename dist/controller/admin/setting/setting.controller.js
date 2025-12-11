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
exports.SettingController = void 0;
const common_1 = require("@nestjs/common");
const setting_service_1 = require("./setting.service");
const common_messages_1 = require("../../../common/common-messages");
const admin_guard_1 = require("../../../authGuard/admin.guard");
let SettingController = class SettingController {
    constructor(SettingService) {
        this.SettingService = SettingService;
    }
    async getfreekeyList(req) {
        try {
            const { keys } = req.query;
            const keyArray = keys ? keys.split(',') : [];
            const data = await this.SettingService.getAllkeys(keyArray);
            return { status: true, message: common_messages_1.CommonMessages.GET_LIST('Setting'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getkeyList(req) {
        try {
            const { keys } = req.query;
            const keyArray = keys ? keys.split(',') : [];
            const data = await this.SettingService.getAllkeys(keyArray);
            return { status: true, message: common_messages_1.CommonMessages.GET_LIST('Setting'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getList(req) {
        try {
            let { s } = req.query;
            const data = await this.SettingService.getAllPages(s);
            return { status: true, message: common_messages_1.CommonMessages.GET_LIST('Setting'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getSettings(key) {
        try {
            const setting = await this.SettingService.getDatabyid(key);
            return { status: true, message: common_messages_1.CommonMessages.updated_data('Setting'), data: setting };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async updateSettings(req, body) {
        try {
            const { updated_data } = body;
            const results = [];
            for (const element of updated_data) {
                const updatedSetting = await this.SettingService.updateData(element.key, { value: element.value });
                results.push(updatedSetting);
            }
            return { status: true, message: common_messages_1.CommonMessages.updated_data('Setting'), data: results };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
};
__decorate([
    (0, common_1.Get)('freekeylist'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingController.prototype, "getfreekeyList", null);
__decorate([
    (0, common_1.Get)('keylist'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingController.prototype, "getkeyList", null);
__decorate([
    (0, common_1.Get)('list'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingController.prototype, "getList", null);
__decorate([
    (0, common_1.Get)('get/:key'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Put)('update'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SettingController.prototype, "updateSettings", null);
SettingController = __decorate([
    (0, common_1.Controller)('/setting'),
    __metadata("design:paramtypes", [setting_service_1.SettingService])
], SettingController);
exports.SettingController = SettingController;
//# sourceMappingURL=setting.controller.js.map