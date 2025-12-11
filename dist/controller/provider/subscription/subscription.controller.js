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
const provider_guard_1 = require("../../../authGuard/provider.guard");
const user_schema_1 = require("../../../schema/user.schema");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const subscription_schema_1 = require("../../../schema/subscription.schema");
const subscription_orders_schema_1 = require("../../../schema/subscription.orders.schema");
const wallet_req_schema_1 = require("../../../schema/wallet_req.schema");
let SubscriptionController = class SubscriptionController {
    constructor(SubscriptionService, UserModel, SubscriptionModel, SubscriptionOrder, WalletReqModel) {
        this.SubscriptionService = SubscriptionService;
        this.UserModel = UserModel;
        this.SubscriptionModel = SubscriptionModel;
        this.SubscriptionOrder = SubscriptionOrder;
        this.WalletReqModel = WalletReqModel;
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
    async SubCreateOrder(createDto, req) {
        try {
            const { subscription_id, amount } = createDto;
            const user_id = req.user.id;
            const subscriptionPlan = await this.SubscriptionModel.findOne({ where: { id: subscription_id } });
            if (!subscriptionPlan) {
                return { status: false, message: 'Invalid subscription plan' };
            }
            const user = await this.UserModel.findOne({ where: { id: user_id } });
            if (!user) {
                return { status: false, message: 'User not found' };
            }
            if (user.wallet_balance < amount) {
                return { status: false, message: 'Insufficient wallet balance' };
            }
            const updatedWalletBalance = user.wallet_balance - amount;
            const currentDate = new Date();
            const expiryDate = new Date();
            expiryDate.setDate(currentDate.getDate() + subscriptionPlan.duration_day);
            await this.UserModel.update({ id: user_id }, {
                wallet_balance: updatedWalletBalance,
                subscription_id: subscription_id,
                expiry_date: expiryDate,
            });
            let SubscriptionOrder = await this.SubscriptionOrder.create({
                user_id: user_id,
                amount: amount,
                status: "Success",
                subscription_id,
            });
            SubscriptionOrder = await this.SubscriptionOrder.save(SubscriptionOrder);
            let WalletReqModel = await this.WalletReqModel.create({
                user_id: user_id,
                user_type: 'Provider',
                amount_status: 'Debit',
                wallet_type: 'Online',
                transaction_id: `SUB-${Date.now()}`,
                currency: 'OMR',
                amount: amount,
                available_amount: updatedWalletBalance,
                remark: `Subscription purchased: ${subscriptionPlan.name}`,
                date: currentDate,
                order_type: "Subscription",
                status: 'Accepted',
            });
            WalletReqModel = await this.WalletReqModel.save(WalletReqModel);
            return {
                status: true,
                message: 'Plan purchase successful',
            };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async SubCancelOrder(createDto, req) {
        const user_id = req.user.id;
        try {
            const user = await this.UserModel.findOne({ where: { id: user_id } });
            if (!user) {
                return { status: false, message: 'User not found' };
            }
            const currentDate = new Date();
            if (user.expiry_date && user.expiry_date <= currentDate) {
                return { status: false, message: 'Subscription already expired' };
            }
            await this.UserModel.update({ id: user_id }, {
                subscription_id: null,
                expiry_date: null,
            });
            const cancellationOrder = await this.SubscriptionOrder.create({
                user_id: user_id,
                amount: 0,
                status: 'Cancelled',
                subscription_id: user.subscription_id,
            });
            await this.SubscriptionOrder.save(cancellationOrder);
            return {
                status: true,
                message: 'Subscription cancelled successfully',
            };
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
    (0, common_1.Post)('/create-order'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "SubCreateOrder", null);
__decorate([
    (0, common_1.Post)('/cancel'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "SubCancelOrder", null);
SubscriptionController = __decorate([
    (0, common_1.Controller)('/user/subscription'),
    (0, common_1.UseGuards)(provider_guard_1.ProviderGuard),
    __param(1, (0, typeorm_2.InjectRepository)(user_schema_1.User)),
    __param(2, (0, typeorm_2.InjectRepository)(subscription_schema_1.Subscription)),
    __param(3, (0, typeorm_2.InjectRepository)(subscription_orders_schema_1.SubscriptionOrder)),
    __param(4, (0, typeorm_2.InjectRepository)(wallet_req_schema_1.Wallet_req)),
    __metadata("design:paramtypes", [subscription_service_1.SubscriptionService,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository])
], SubscriptionController);
exports.SubscriptionController = SubscriptionController;
//# sourceMappingURL=subscription.controller.js.map