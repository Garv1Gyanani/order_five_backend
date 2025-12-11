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
exports.OrderController = void 0;
const common_1 = require("@nestjs/common");
const order_management_service_1 = require("./order_management.service");
const common_messages_1 = require("../../../common/common-messages");
const order_schema_1 = require("../../../schema/order.schema");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const provider_guard_1 = require("../../../authGuard/provider.guard");
const admin = require("firebase-admin");
const dotenv = require("dotenv");
const notification_schema_1 = require("../../../schema/notification.schema");
const user_schema_1 = require("../../../schema/user.schema");
dotenv.config();
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CREDENTIALS || '{}')),
    });
}
let OrderController = class OrderController {
    constructor(OrderService, Order, NotificationModel, User) {
        this.OrderService = OrderService;
        this.Order = Order;
        this.NotificationModel = NotificationModel;
        this.User = User;
    }
    async getOrderCount(req) {
        try {
            const user_id = req.user.id;
            const data = await this.OrderService.getOrderCount(user_id);
            return data;
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getRecentOrder(req) {
        try {
            const user_id = req.user.id;
            const data = await this.OrderService.getRecentOrder(user_id);
            return data;
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getpayment(req, id) {
        try {
            const user_id = req.user.id;
            const data = await this.OrderService.getpayment(id);
            return data;
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getOrderList(req) {
        try {
            const user_id = req.user.id;
            const { page = 1, size = 10, s = '', status } = req.query;
            const data = await this.OrderService.getOrderList(page, size, s, user_id, status);
            return data;
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async orderCancle(id, updateData) {
        try {
            const order = await this.Order.findOne({ where: { id } });
            if (!order) {
                return { status: false, message: common_messages_1.CommonMessages.notFound('Order') };
            }
            const realUser = await this.User.findOne({ where: { id: order.user_id } });
            const updateFields = {
                status: 'CANCELBYPROVIDER',
                remark: updateData.remark
            };
            const data = await this.OrderService.updateData(id, updateFields);
            const notificationTitle = "Order Cancel";
            const notificationDescription = `your order has been cancelled by provider`;
            const dataPayload = await this.NotificationModel.save({
                title: notificationTitle,
                description: notificationDescription,
                user_id: realUser.id,
                click_event: 'order',
                createdAt: new Date(),
            });
            const deviceToken = realUser.device_token;
            if (deviceToken) {
                const notificationPayload = {
                    notification: {
                        title: notificationTitle,
                        body: notificationDescription,
                    },
                    data: {
                        title: dataPayload.title,
                        description: dataPayload.description,
                        user_id: dataPayload.user_id.toString(),
                        click_event: dataPayload.click_event,
                        createdAt: dataPayload.createdAt.toISOString(),
                    },
                    token: deviceToken,
                };
                try {
                    const response = await admin.messaging().send(notificationPayload);
                    console.log(`Notification sent successfully: ${response}`);
                }
                catch (error) {
                    console.error('Error sending notification:', error.message || error);
                }
            }
            else {
                console.log('No device token found for the user.');
            }
            return { status: true, message: common_messages_1.CommonMessages.updated_data('Order'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async orderACCEPT(id, updateData) {
        try {
            const order = await this.Order.findOne({ where: { id } });
            if (!order) {
                return { status: false, message: common_messages_1.CommonMessages.notFound('Order') };
            }
            const realUser = await this.User.findOne({ where: { id: order.user_id } });
            const updateFields = {
                status: 'ACCEPTED',
            };
            const data = await this.OrderService.updateData(id, updateFields);
            const notificationTitle = "Order Accept";
            const notificationDescription = `Your order has been accepted by provider`;
            const dataPayload = await this.NotificationModel.save({
                title: notificationTitle,
                description: notificationDescription,
                user_id: realUser.id,
                click_event: 'order',
                createdAt: new Date(),
            });
            const deviceToken = realUser.device_token;
            if (deviceToken) {
                const notificationPayload = {
                    notification: {
                        title: notificationTitle,
                        body: notificationDescription,
                    },
                    data: {
                        title: dataPayload.title,
                        description: dataPayload.description,
                        user_id: dataPayload.user_id.toString(),
                        click_event: dataPayload.click_event,
                        createdAt: dataPayload.createdAt.toISOString(),
                    },
                    token: deviceToken,
                };
                try {
                    const response = await admin.messaging().send(notificationPayload);
                    console.log(`Notification sent successfully: ${response}`);
                }
                catch (error) {
                    console.error('Error sending notification:', error.message || error);
                }
            }
            else {
                console.log('No device token found for the user.');
            }
            return { status: true, message: common_messages_1.CommonMessages.updated_data('Order'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async orderCompalate(id, updateData) {
        try {
            const order = await this.Order.findOne({ where: { id } });
            if (!order) {
                return { status: false, message: common_messages_1.CommonMessages.notFound('Order') };
            }
            const realUser = await this.User.findOne({ where: { id: order.user_id } });
            const updateFields = {
                status: 'DELIVERED',
                delivery_date: new Date()
            };
            const data = await this.OrderService.updateData(id, updateFields);
            const notificationTitle = "Order Delivered";
            const notificationDescription = `Your order has been delivered by provider`;
            const dataPayload = await this.NotificationModel.save({
                title: notificationTitle,
                description: notificationDescription,
                user_id: realUser.id,
                click_event: 'order',
                createdAt: new Date(),
            });
            const deviceToken = realUser.device_token;
            if (deviceToken) {
                const notificationPayload = {
                    notification: {
                        title: notificationTitle,
                        body: notificationDescription,
                    },
                    data: {
                        title: dataPayload.title,
                        description: dataPayload.description,
                        user_id: dataPayload.user_id.toString(),
                        click_event: dataPayload.click_event,
                        createdAt: dataPayload.createdAt.toISOString(),
                    },
                    token: deviceToken,
                };
                try {
                    const response = await admin.messaging().send(notificationPayload);
                    console.log(`Notification sent successfully: ${response}`);
                }
                catch (error) {
                    console.error('Error sending notification:', error.message || error);
                }
            }
            else {
                console.log('No device token found for the user.');
            }
            return { status: true, message: common_messages_1.CommonMessages.updated_data('Order'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
};
__decorate([
    (0, common_1.Get)('order-count'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getOrderCount", null);
__decorate([
    (0, common_1.Get)('recent-order'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getRecentOrder", null);
__decorate([
    (0, common_1.Get)('payment-details/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getpayment", null);
__decorate([
    (0, common_1.Get)('order-list'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getOrderList", null);
__decorate([
    (0, common_1.Put)('order-cancle/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "orderCancle", null);
__decorate([
    (0, common_1.Put)('order-accept/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "orderACCEPT", null);
__decorate([
    (0, common_1.Put)('order-complete/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "orderCompalate", null);
OrderController = __decorate([
    (0, common_1.Controller)('/provider/product'),
    (0, common_1.UseGuards)(provider_guard_1.ProviderGuard),
    __param(1, (0, typeorm_2.InjectRepository)(order_schema_1.Order)),
    __param(2, (0, typeorm_2.InjectRepository)(notification_schema_1.Notification)),
    __param(3, (0, typeorm_2.InjectRepository)(user_schema_1.User)),
    __metadata("design:paramtypes", [order_management_service_1.OrderService,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository])
], OrderController);
exports.OrderController = OrderController;
//# sourceMappingURL=order_management.controller.js.map