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
exports.WalletRequestController = void 0;
const common_1 = require("@nestjs/common");
const wallet_request_service_1 = require("./wallet_request.service");
const common_messages_1 = require("../../../common/common-messages");
const provider_guard_1 = require("../../../authGuard/provider.guard");
const options_1 = require("../../../common/options");
const user_schema_1 = require("../../../schema/user.schema");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
let WalletRequestController = class WalletRequestController {
    constructor(WalletRequestService, UserModel) {
        this.WalletRequestService = WalletRequestService;
        this.UserModel = UserModel;
    }
    async getList(req) {
        try {
            const { page, size, s, status } = req.query;
            let user_id = req.user.id;
            let data = await this.WalletRequestService.getAllPages(user_id, page, size, s, status);
            let user_data = await this.UserModel.findOne({ where: { id: user_id } });
            data.wallet_balance = (user_data === null || user_data === void 0 ? void 0 : user_data.wallet_balance) || 0;
            return { status: true, message: common_messages_1.CommonMessages.GET_LIST("Wallet Request"), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getbyId(id) {
        try {
            const data = await this.WalletRequestService.getData(id);
            return { status: true, message: common_messages_1.CommonMessages.GET_DATA("Wallet Request"), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async createProfile(createDto, req) {
        try {
            let user_id = req.user.id;
            createDto.amount_status = createDto.amount > 0 ? options_1.OptionsMessage.AMOUNT_STATUS.Credit : options_1.OptionsMessage.AMOUNT_STATUS.Debit;
            createDto.user_type = options_1.OptionsMessage.WALLET_TYPE.Provider;
            let userData = await this.UserModel.findOne({ where: { id: user_id } });
            if (!userData) {
                return { status: false, message: common_messages_1.CommonMessages.notFound('User') };
            }
            if (Number(userData === null || userData === void 0 ? void 0 : userData.wallet_balance) < 1) {
                createDto.available_amount = Number(userData === null || userData === void 0 ? void 0 : userData.wallet_balance) || 0;
            }
            else {
                let walletbalance = (Number(userData === null || userData === void 0 ? void 0 : userData.wallet_balance) || 0) + createDto.amount;
                createDto.available_amount = walletbalance;
            }
            const data = await this.WalletRequestService.createData(createDto);
            return { status: true, message: common_messages_1.CommonMessages.created_data("Wallet Request"), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async updateProfile(id, updateData) {
        try {
            const data = await this.WalletRequestService.updateData(id, updateData);
            return { status: true, message: common_messages_1.CommonMessages.updated_data("Wallet Request"), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async deleteProfile(id) {
        try {
            await this.WalletRequestService.deleteData(id);
            return { status: true, message: common_messages_1.CommonMessages.deleted_data("Wallet Request") };
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
], WalletRequestController.prototype, "getList", null);
__decorate([
    (0, common_1.Get)('get/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], WalletRequestController.prototype, "getbyId", null);
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WalletRequestController.prototype, "createProfile", null);
__decorate([
    (0, common_1.Put)('update/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], WalletRequestController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Delete)('delete/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], WalletRequestController.prototype, "deleteProfile", null);
WalletRequestController = __decorate([
    (0, common_1.Controller)('/provider/walletrequest'),
    (0, common_1.UseGuards)(provider_guard_1.ProviderGuard),
    __param(1, (0, typeorm_2.InjectRepository)(user_schema_1.User)),
    __metadata("design:paramtypes", [wallet_request_service_1.WalletRequestService,
        typeorm_1.Repository])
], WalletRequestController);
exports.WalletRequestController = WalletRequestController;
//# sourceMappingURL=wallet_request.controller.js.map