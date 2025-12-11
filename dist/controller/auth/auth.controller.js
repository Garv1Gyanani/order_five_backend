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
exports.LoginController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const admin_guard_1 = require("../../authGuard/admin.guard");
const common_messages_1 = require("../../common/common-messages");
const provider_guard_1 = require("../../authGuard/provider.guard");
const user_guard_1 = require("../../authGuard/user.guard");
let LoginController = class LoginController {
    constructor(LoginService) {
        this.LoginService = LoginService;
    }
    async AdminLogin(email, password) {
        return this.LoginService.Adminlogin(email, password);
    }
    async AdminLogout(req) {
        let user_id = req.body.id;
        return { status: true, message: common_messages_1.CommonMessages.LOGOUT_SUCCESS };
    }
    async forgetPassword(email) {
        return await this.LoginService.forgetPassword(email);
    }
    async resetPassword(body) {
        return await this.LoginService.resetPassword(body);
    }
    async providerregister(req) {
        let { phone_num, name, dialing_code } = req.body;
        const response = await this.LoginService.providerregister(phone_num, name, dialing_code);
        return response;
    }
    async providerregisterverify(req) {
        let { phone_num, otp, dialing_code, name } = req.body;
        const response = await this.LoginService.providerregisterverify(phone_num, otp, dialing_code, name);
        return response;
    }
    async providerLogin(req) {
        let { phone_num, dialing_code } = req.body;
        let response = this.LoginService.Providerlogin(phone_num, dialing_code);
        return response;
    }
    async ProviderverifyOTP(body) {
        return this.LoginService.ProviderverifyOTP(body.phone_num, body.otp, body.dialing_code, body.device_token);
    }
    async ProviderLogout(req) {
        let user_id = req.body.id;
        return { status: true, message: common_messages_1.CommonMessages.LOGOUT_SUCCESS };
    }
    async Customerregister(req) {
        let { phone_num, name, dialing_code } = req.body;
        const response = await this.LoginService.Customerregister(phone_num, name, dialing_code);
        return response;
    }
    async Customerregisterverify(req) {
        let { phone_num, otp, dialing_code, name } = req.body;
        const response = await this.LoginService.Customerregisterverify(phone_num, otp, dialing_code, name);
        return response;
    }
    async login(body) {
        return this.LoginService.login(body.phone_num, body.dialing_code);
    }
    async verifyOTP(body) {
        return this.LoginService.verifyOTP(body.phone_num, body.otp, body.dialing_code, body.device_token);
    }
    async CustomerLogout(req) {
        let user_id = req.body.id;
        return { status: true, message: common_messages_1.CommonMessages.LOGOUT_SUCCESS };
    }
};
__decorate([
    (0, common_1.Post)('admin/login'),
    __param(0, (0, common_1.Body)('email')),
    __param(1, (0, common_1.Body)('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "AdminLogin", null);
__decorate([
    (0, common_1.Post)('admin/logout'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "AdminLogout", null);
__decorate([
    (0, common_1.Post)('admin/forget-password'),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "forgetPassword", null);
__decorate([
    (0, common_1.Post)('admin/reset-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('provider/registersendotp'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "providerregister", null);
__decorate([
    (0, common_1.Post)('provider/registerverifyotp'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "providerregisterverify", null);
__decorate([
    (0, common_1.Post)('provider/loginsendotp'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "providerLogin", null);
__decorate([
    (0, common_1.Post)('provider/loginverify'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "ProviderverifyOTP", null);
__decorate([
    (0, common_1.Post)('provider/logout'),
    (0, common_1.UseGuards)(provider_guard_1.ProviderGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "ProviderLogout", null);
__decorate([
    (0, common_1.Post)('customer/registersendotp'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "Customerregister", null);
__decorate([
    (0, common_1.Post)('customer/registerverifyotp'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "Customerregisterverify", null);
__decorate([
    (0, common_1.Post)('customer/sendotp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('customer/verify'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "verifyOTP", null);
__decorate([
    (0, common_1.Post)('customer/logout'),
    (0, common_1.UseGuards)(user_guard_1.UserGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "CustomerLogout", null);
LoginController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [auth_service_1.LoginService])
], LoginController);
exports.LoginController = LoginController;
//# sourceMappingURL=auth.controller.js.map