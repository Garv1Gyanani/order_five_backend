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
exports.WalletManagementController = void 0;
const common_1 = require("@nestjs/common");
const wallet_management_service_1 = require("./wallet_management.service");
const common_messages_1 = require("../../../common/common-messages");
const admin_guard_1 = require("../../../authGuard/admin.guard");
const options_1 = require("../../../common/options");
const typeorm_1 = require("@nestjs/typeorm");
const user_schema_1 = require("../../../schema/user.schema");
const typeorm_2 = require("typeorm");
const admin = require("firebase-admin");
const dotenv = require("dotenv");
const notification_schema_1 = require("../../../schema/notification.schema");
dotenv.config();
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CREDENTIALS || '{}')),
    });
}
let WalletManagementController = class WalletManagementController {
    constructor(WalletManagementService, UserModel, NotificationModel) {
        this.WalletManagementService = WalletManagementService;
        this.UserModel = UserModel;
        this.NotificationModel = NotificationModel;
    }
    async getList(req) {
        try {
            const { page, size, s, status } = req.query;
            const data = await this.WalletManagementService.getAllPages(page, size, s, status);
            return { status: true, message: common_messages_1.CommonMessages.GET_LIST("Wallet Request"), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getUserList(req, id) {
        try {
            const { page, size, s, status } = req.query;
            const data = await this.WalletManagementService.getUserAllPages(id, page, size, s, status);
            return { status: true, message: common_messages_1.CommonMessages.GET_LIST("Wallet Request"), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getbyId(id) {
        try {
            const data = await this.WalletManagementService.getData(id);
            return { status: true, message: common_messages_1.CommonMessages.GET_DATA("Wallet Request"), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async createdata(createDto) {
        try {
            let user_response = await this.UserModel.findOne({ where: { id: createDto === null || createDto === void 0 ? void 0 : createDto.user_id } });
            if (!user_response) {
                return { status: false, message: common_messages_1.CommonMessages.notFound("User") };
            }
            let wallet_balance = (user_response === null || user_response === void 0 ? void 0 : user_response.wallet_balance) || 0;
            if (createDto.amount < 0) {
                let amount = wallet_balance - Math.abs(createDto.amount);
                if (amount < 0) {
                    return { status: false, message: "You cannot deduct an amount greater than the actual balance" };
                }
            }
            if (Number(user_response === null || user_response === void 0 ? void 0 : user_response.wallet_balance) < 1) {
                createDto.available_amount = Number(user_response === null || user_response === void 0 ? void 0 : user_response.wallet_balance) || 0;
            }
            else {
                let walletbalance = (Number(user_response === null || user_response === void 0 ? void 0 : user_response.wallet_balance) || 0) + createDto.amount;
                createDto.available_amount = walletbalance;
            }
            createDto.wallet_type = options_1.OptionsMessage.WALLET_PAYMENT_TYPE.Online;
            createDto.status = options_1.OptionsMessage.WALLET_STATUS.Approved;
            createDto.amount_status = createDto.amount > 0 ? options_1.OptionsMessage.AMOUNT_STATUS.Credit : options_1.OptionsMessage.AMOUNT_STATUS.Debit;
            console.log({ createDto });
            const data = await this.WalletManagementService.createData(createDto);
            if (createDto === null || createDto === void 0 ? void 0 : createDto.user_id) {
                let user_response = await this.UserModel.findOne({ where: { id: createDto === null || createDto === void 0 ? void 0 : createDto.user_id } });
                if (user_response) {
                    let wallet_balance = parseFloat((user_response === null || user_response === void 0 ? void 0 : user_response.wallet_balance) || '0');
                    wallet_balance += parseFloat((createDto === null || createDto === void 0 ? void 0 : createDto.amount) || '0');
                    await this.UserModel.update(createDto.user_id, { wallet_balance });
                }
            }
            return { status: true, message: common_messages_1.CommonMessages.created_data("Wallet Request"), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async updatedata(id, updateData) {
        try {
            const data = await this.WalletManagementService.updateData(id, updateData);
            return { status: true, message: common_messages_1.CommonMessages.updated_data("Wallet Request"), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async AcceptWalletReq(id) {
        try {
            const wallet_req_get = await this.WalletManagementService.getData(id);
            if (!wallet_req_get) {
                return { status: false, message: common_messages_1.CommonMessages.notFound("Wallet Request") };
            }
            const data = await this.WalletManagementService.updateData(id, { status: options_1.OptionsMessage.WALLET_STATUS.Approved });
            if (wallet_req_get === null || wallet_req_get === void 0 ? void 0 : wallet_req_get.user_id) {
                const user_response = await this.UserModel.findOne({ where: { id: wallet_req_get.user_id } });
                if (user_response) {
                    let wallet_balance = parseFloat((user_response === null || user_response === void 0 ? void 0 : user_response.wallet_balance) || '0');
                    wallet_balance += parseFloat((wallet_req_get === null || wallet_req_get === void 0 ? void 0 : wallet_req_get.amount) || '0');
                    await this.UserModel.update(wallet_req_get.user_id, { wallet_balance });
                    const notificationTitle = "Wallet Request Approved";
                    const notificationDescription = `Your wallet request of amount ${wallet_req_get.amount} has been approved.`;
                    const dataPayload = await this.NotificationModel.save({
                        title: notificationTitle,
                        description: notificationDescription,
                        user_id: user_response.id,
                        click_event: 'wallet',
                        createdAt: new Date(),
                    });
                    const deviceToken = user_response.device_token;
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
                            console.log('Error sending notification:', error.message || error);
                        }
                    }
                    else {
                        console.log('No device token found for the user.');
                    }
                }
            }
            return { status: true, message: "Wallet request has been accepted successfully", data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async RejectWalletReq(id) {
        try {
            const data = await this.WalletManagementService.updateData(id, { status: options_1.OptionsMessage.WALLET_STATUS.Rejected });
            const wallet_req_get = await this.WalletManagementService.getData(id);
            if (wallet_req_get === null || wallet_req_get === void 0 ? void 0 : wallet_req_get.user_id) {
                const user_response = await this.UserModel.findOne({ where: { id: wallet_req_get.user_id } });
                const notificationTitle = "Wallet Request Rejected";
                const notificationDescription = `Your wallet request of amount ${wallet_req_get.amount} has been rejected.`;
                const dataPayload = await this.NotificationModel.save({
                    title: notificationTitle,
                    description: notificationDescription,
                    user_id: user_response.id,
                    click_event: 'wallet',
                    createdAt: new Date(),
                });
                const deviceToken = user_response.device_token;
                console.log(deviceToken, "deviceTokendeviceToken");
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
            }
            return { status: true, message: "Wallet request has been rejected successfully", data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async deletedata(id) {
        try {
            await this.WalletManagementService.deleteData(id);
            return { status: true, message: common_messages_1.CommonMessages.deleted_data("Wallet Request") };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async bulkDeletedata(ids) {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                return { status: false, message: `Please select wallet request for delete`, };
            }
            const deletedCount = await this.WalletManagementService.bulkDeletedata(ids);
            return { status: true, message: `${deletedCount} wallet request deleted successfully`, };
        }
        catch (error) {
            return { status: false, message: error.message, };
        }
    }
};
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletManagementController.prototype, "getList", null);
__decorate([
    (0, common_1.Get)('userlist/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], WalletManagementController.prototype, "getUserList", null);
__decorate([
    (0, common_1.Get)('get/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], WalletManagementController.prototype, "getbyId", null);
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletManagementController.prototype, "createdata", null);
__decorate([
    (0, common_1.Put)('update/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], WalletManagementController.prototype, "updatedata", null);
__decorate([
    (0, common_1.Put)('acceptwalletreq/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], WalletManagementController.prototype, "AcceptWalletReq", null);
__decorate([
    (0, common_1.Put)('rejectwalletreq/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], WalletManagementController.prototype, "RejectWalletReq", null);
__decorate([
    (0, common_1.Delete)('delete/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], WalletManagementController.prototype, "deletedata", null);
__decorate([
    (0, common_1.Delete)('bulkdelete'),
    __param(0, (0, common_1.Body)('ids')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], WalletManagementController.prototype, "bulkDeletedata", null);
WalletManagementController = __decorate([
    (0, common_1.Controller)('/walletbalance'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(1, (0, typeorm_1.InjectRepository)(user_schema_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(notification_schema_1.Notification)),
    __metadata("design:paramtypes", [wallet_management_service_1.WalletManagementService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], WalletManagementController);
exports.WalletManagementController = WalletManagementController;
//# sourceMappingURL=wallet_management.controller.js.map