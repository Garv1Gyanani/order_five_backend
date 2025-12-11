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
exports.WalletRequestService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const wallet_req_schema_1 = require("../../../schema/wallet_req.schema");
const common_util_1 = require("../../../common/common.util");
const common_messages_1 = require("../../../common/common-messages");
const moment = require("moment-timezone");
let WalletRequestService = class WalletRequestService {
    constructor(WalletRequestModel) {
        this.WalletRequestModel = WalletRequestModel;
    }
    async getAllPages(user_id, page = 1, pageSize = 10, search = '', status) {
        try {
            const { limit, offset } = common_util_1.default.getPagination(page, pageSize);
            const whereCondition = { user_id: user_id };
            if (status) {
                whereCondition.status = status;
            }
            if (search) {
                whereCondition.user = {
                    name: (0, typeorm_2.Like)(`%${search}%`),
                    phone_num: (0, typeorm_2.Like)(`%${search}%`)
                };
            }
            const [pages, count] = await this.WalletRequestModel.findAndCount({
                where: whereCondition,
                relations: ['user'],
                skip: offset,
                take: limit,
                select: {
                    user: { name: true, phone_num: true, user_role: true }
                },
                order: { createdAt: 'DESC' }
            });
            const paginatedData = common_util_1.default.getPagingData({ count, rows: pages }, page, limit);
            return paginatedData;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getData(id) {
        try {
            const WalletRequest = await this.WalletRequestModel.findOne({ where: { id: id } });
            if (!WalletRequest) {
                throw new Error(common_messages_1.CommonMessages.notFound("Wallet request"));
            }
            return WalletRequest;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getDatabyid(id) {
        try {
            const WalletRequest = await this.WalletRequestModel.findOne({ where: { id: id } });
            if (!WalletRequest) {
                throw new Error(common_messages_1.CommonMessages.notFound("Wallet request"));
            }
            return WalletRequest;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async createData(data) {
        try {
            data.createdAt = moment.tz('Asia/Riyadh').format('YYYY-MM-DD HH:mm:ss');
            if (data.transaction_id) { }
            else {
                let transaction_id = common_util_1.default.createTransactionId();
                data.transaction_id = transaction_id;
            }
            let newWalletRequest = await this.WalletRequestModel.create(data);
            newWalletRequest = await this.WalletRequestModel.save(newWalletRequest);
            return newWalletRequest;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async updateData(id, updateData) {
        try {
            let response = await this.WalletRequestModel.update(id, updateData);
            if (response[0] === 0) {
                throw new Error("No WalletRequest data was updated.");
            }
            return response;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async deleteData(id) {
        try {
            const WalletRequest = await this.WalletRequestModel.findOne({ where: { id: id } });
            if (!WalletRequest) {
                throw new Error(common_messages_1.CommonMessages.notFound("Wallet request"));
            }
            await this.WalletRequestModel.softDelete(id);
            return WalletRequest;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
};
WalletRequestService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(wallet_req_schema_1.Wallet_req)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], WalletRequestService);
exports.WalletRequestService = WalletRequestService;
//# sourceMappingURL=wallet_request.service.js.map