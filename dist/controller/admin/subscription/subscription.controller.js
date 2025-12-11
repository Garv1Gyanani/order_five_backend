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
exports.SubscriptionController = void 0;
const common_1 = require("@nestjs/common");
const subscription_service_1 = require("./subscription.service");
const common_messages_1 = require("../../../common/common-messages");
const admin_guard_1 = require("../../../authGuard/admin.guard");
let SubscriptionController = class SubscriptionController {
    constructor(SubscriptionService) {
        this.SubscriptionService = SubscriptionService;
    }
    async getList(req) {
        try {
            const { page, size, s } = req.query;
            const data = await this.SubscriptionService.getAllPages(page, size, s);
            return { status: true, message: common_messages_1.CommonMessages.GET_LIST('Subscription'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getbyId(id) {
        try {
            const data = await this.SubscriptionService.getData(id);
            return { status: true, message: common_messages_1.CommonMessages.GET_DATA('Subscription'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getDataByUserId(id) {
        try {
            const data = await this.SubscriptionService.getDataByUserId(id);
            return { status: true, message: common_messages_1.CommonMessages.GET_DATA('Subscription details'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async createdata(createDto) {
        try {
            const data = await this.SubscriptionService.createData(createDto);
            return { status: true, message: common_messages_1.CommonMessages.created_data('Subscription'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async updatedata(id, updateData) {
        try {
            const data = await this.SubscriptionService.updateData(id, updateData);
            return { status: true, message: common_messages_1.CommonMessages.updated_data('Subscription'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async deletedata(id) {
        try {
            await this.SubscriptionService.deleteData(id);
            return { status: true, message: common_messages_1.CommonMessages.deleted_data('Subscription') };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async bulkDeletedata(ids) {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                return { status: false, message: `Please select Subscription for delete`, };
            }
            const deletedCount = await this.SubscriptionService.bulkDeletedata(ids);
            return { status: true, message: `${deletedCount} subscription deleted successfully`, };
        }
        catch (error) {
            return { status: false, message: error.message, };
        }
    }
    async getsubscriberList(req) {
        try {
            const { page, size, s, status } = req.query;
            const data = await this.SubscriptionService.getsubscriberList(page, size, s, status);
            return data;
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
], SubscriptionController.prototype, "getList", null);
__decorate([
    (0, common_1.Get)('get/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getbyId", null);
__decorate([
    (0, common_1.Get)('userget/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getDataByUserId", null);
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "createdata", null);
__decorate([
    (0, common_1.Put)('update/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "updatedata", null);
__decorate([
    (0, common_1.Delete)('delete/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "deletedata", null);
__decorate([
    (0, common_1.Delete)('/bulkdelete'),
    __param(0, (0, common_1.Body)('ids')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "bulkDeletedata", null);
__decorate([
    (0, common_1.Get)('subscriber-list'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getsubscriberList", null);
SubscriptionController = __decorate([
    (0, common_1.Controller)('/subscription'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __metadata("design:paramtypes", [subscription_service_1.SubscriptionService])
], SubscriptionController);
exports.SubscriptionController = SubscriptionController;
//# sourceMappingURL=subscription.controller.js.map