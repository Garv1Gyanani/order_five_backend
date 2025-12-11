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
exports.NotificationController = void 0;
const common_1 = require("@nestjs/common");
const notification_service_1 = require("./notification.service");
const common_messages_1 = require("../../../common/common-messages");
const notification_schema_1 = require("../../../schema/notification.schema");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const admin_guard_1 = require("../../../authGuard/admin.guard");
let NotificationController = class NotificationController {
    constructor(NotificationService, Notification) {
        this.NotificationService = NotificationService;
        this.Notification = Notification;
    }
    async createNotification(createDto) {
        try {
            const payload = {
                title: createDto.title,
                description: createDto.description,
                image: createDto.image,
                user_type: createDto.user_type,
            };
            await this.NotificationService.sendPushNotification(payload);
            return { status: true, message: 'Notification sent successfully!' };
        }
        catch (error) {
            console.error('Error creating notification:', error.message || error);
            return { status: false, message: error.message };
        }
    }
    async getList(req) {
        try {
            const { page, size, s } = req.query;
            const data = await this.NotificationService.getAllPages(page, size, s);
            return { status: true, message: common_messages_1.CommonMessages.GET_LIST('notification'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
};
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "createNotification", null);
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getList", null);
NotificationController = __decorate([
    (0, common_1.Controller)('/admin/notification'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(1, (0, typeorm_2.InjectRepository)(notification_schema_1.Notification)),
    __metadata("design:paramtypes", [notification_service_1.NotificationService,
        typeorm_1.Repository])
], NotificationController);
exports.NotificationController = NotificationController;
//# sourceMappingURL=notification.controller.js.map