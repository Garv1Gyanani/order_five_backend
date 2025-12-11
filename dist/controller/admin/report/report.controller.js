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
exports.ReportController = void 0;
const common_1 = require("@nestjs/common");
const report_service_1 = require("./report.service");
const common_messages_1 = require("../../../common/common-messages");
const admin_guard_1 = require("../../../authGuard/admin.guard");
const xlsx = require("xlsx");
const options_1 = require("../../../common/options");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const wallet_req_schema_1 = require("../../../schema/wallet_req.schema");
const user_schema_1 = require("../../../schema/user.schema");
const common_util_1 = require("../../../common/common.util");
let ReportController = class ReportController {
    constructor(ReportService, Wallet_req, User) {
        this.ReportService = ReportService;
        this.Wallet_req = Wallet_req;
        this.User = User;
    }
    async getList(req) {
        try {
            const { page, size, s } = req.query;
            const data = await this.ReportService.getAllPages(page, size, s);
            return { status: true, message: common_messages_1.CommonMessages.GET_LIST('Subscription'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async updatedata(req, id, updateData) {
        try {
            const { block_day, is_pr_block } = updateData;
            const data = await this.ReportService.updateData(id, block_day, is_pr_block);
            return { status: true, message: 'User block successful', data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getreportcounts(req) {
        try {
            const { start_date, end_date } = req.query;
            let whereConditions = {};
            if (start_date && end_date) {
                whereConditions['createdAt'] = (0, typeorm_2.Between)(new Date(start_date), new Date(end_date));
            }
            const records = await this.Wallet_req.find({
                where: Object.assign(Object.assign({}, whereConditions), { status: (0, typeorm_2.In)([options_1.OptionsMessage.WALLET_STATUS.Approved, 'Accepted']) }),
            });
            const offlineCount = await this.Wallet_req.count({
                where: Object.assign(Object.assign({}, whereConditions), { status: options_1.OptionsMessage.WALLET_STATUS.Approved, wallet_type: 'Offline' }),
            });
            const onlineCount = await this.Wallet_req.count({
                where: Object.assign(Object.assign({}, whereConditions), { status: options_1.OptionsMessage.WALLET_STATUS.Approved, wallet_type: 'Online' }),
            });
            const subscriptionCount = await this.Wallet_req.count({
                where: Object.assign(Object.assign({}, whereConditions), { status: 'Accepted', order_type: 'Subscription' }),
            });
            const costPerOrderCount = await this.Wallet_req.count({
                where: Object.assign(Object.assign({}, whereConditions), { status: options_1.OptionsMessage.WALLET_STATUS.Approved, order_type: 'order' }),
            });
            const unusedBalance = await this.User.count({});
            const offlineSum = await this.Wallet_req.createQueryBuilder('wallet')
                .select('SUM(wallet.amount)', 'sum')
                .where('wallet.status = :status', { status: options_1.OptionsMessage.WALLET_STATUS.Approved })
                .andWhere('wallet.wallet_type = :type', { type: 'Offline' })
                .andWhere(whereConditions)
                .getRawOne();
            const onlineSum = await this.Wallet_req.createQueryBuilder('wallet')
                .select('SUM(wallet.amount)', 'sum')
                .where('wallet.status = :status', { status: options_1.OptionsMessage.WALLET_STATUS.Approved })
                .andWhere('wallet.wallet_type = :type', { type: 'Online' })
                .andWhere(whereConditions)
                .getRawOne();
            const subscriptionSum = await this.Wallet_req.createQueryBuilder('wallet')
                .select('SUM(wallet.amount)', 'sum')
                .where('wallet.status = :status', { status: 'Accepted' })
                .andWhere('wallet.order_type = :type', { type: 'Subscription' })
                .andWhere(whereConditions)
                .getRawOne();
            const costPerOrderSum = await this.Wallet_req.createQueryBuilder('wallet')
                .select('SUM(wallet.amount)', 'sum')
                .where('wallet.status = :status', { status: options_1.OptionsMessage.WALLET_STATUS.Approved })
                .andWhere('wallet.order_type = :type', { type: 'order' })
                .andWhere(whereConditions)
                .getRawOne();
            const unUsedBalance = await this.User.createQueryBuilder('wallet')
                .select('SUM(wallet.wallet_balance)', 'sum')
                .getRawOne();
            const response = {
                offline: {
                    count: offlineCount,
                    totalAmount: offlineSum.sum || 0,
                },
                online: {
                    count: onlineCount,
                    totalAmount: onlineSum.sum || 0,
                },
                subscription: {
                    count: subscriptionCount,
                    totalAmount: subscriptionSum.sum || 0,
                },
                costPerOrder: {
                    count: costPerOrderCount,
                    totalAmount: costPerOrderSum.sum || 0,
                },
                unUsedBalance: {
                    totalAmount: unUsedBalance.sum || 0,
                    count: unusedBalance,
                },
            };
            return { status: true, message: common_messages_1.CommonMessages.GET_LIST('Dashboard'), data: response };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async IncomeReport(req) {
        try {
            const { page = 1, size = 10, start_date, end_date, s, user_type, wallet_type } = req.query;
            let whereConditions = {};
            if (start_date && end_date) {
                whereConditions['createdAt'] = (0, typeorm_2.Between)(new Date(start_date), new Date(end_date));
            }
            if (user_type) {
                whereConditions['user_type'] = (0, typeorm_2.Like)(`%${user_type}%`);
            }
            if (wallet_type) {
                whereConditions['wallet_type'] = (0, typeorm_2.Like)(`%${wallet_type}%`);
            }
            const { limit, offset } = common_util_1.default.getPagination(page, size);
            const [records, totalCount] = await this.Wallet_req.findAndCount({
                where: Object.assign(Object.assign({}, whereConditions), { status: (0, typeorm_2.In)([options_1.OptionsMessage.WALLET_STATUS.Approved, 'Accepted']) }),
                skip: offset,
                take: limit,
                order: { createdAt: 'DESC' },
            });
            const enrichedRecords = await Promise.all(records.map(async (record) => {
                const user = await this.User.findOne({
                    where: Object.assign({ id: record.user_id }, (s ? { name: (0, typeorm_2.Like)(`%${s}%`) } : {})),
                });
                return Object.assign(Object.assign({}, record), { user: user
                        ? { name: user.name, phone_num: user.phone_num, image_url: user.image_url }
                        : { name: null, phone_num: null, image_url: null } });
            }));
            const response = {
                data: {
                    totalItems: totalCount,
                    data: enrichedRecords.filter((record) => record.user.name !== null),
                    totalPages: Math.ceil(totalCount / size),
                    currentPage: Number(page),
                },
            };
            return { status: true, message: common_messages_1.CommonMessages.GET_LIST('income report'), data: response };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async exportIncomeReport(req, res) {
        try {
            const { start_date, end_date } = req.query;
            let whereConditions = {};
            if (start_date && end_date) {
                whereConditions['createdAt'] = (0, typeorm_2.Between)(new Date(start_date), new Date(end_date));
            }
            const data = await this.Wallet_req.find({
                where: Object.assign(Object.assign({}, whereConditions), { status: (0, typeorm_2.In)([options_1.OptionsMessage.WALLET_STATUS.Approved, 'Accepted']) }),
                order: { createdAt: 'DESC' },
            });
            const enrichedData = await Promise.all(data.map(async (record) => {
                const user = await this.User.findOne({ where: { id: record.user_id } });
                return Object.assign(Object.assign({}, record), { user: user
                        ? { name: user.name, phone_num: user.phone_num }
                        : { name: null, phone_num: null } });
            }));
            const exportedData = enrichedData.map((item) => {
                var _a, _b;
                return ({
                    "Transaction ID": item.transaction_id || '',
                    "User Name": ((_a = item.user) === null || _a === void 0 ? void 0 : _a.name) || '',
                    "Phone Number": ((_b = item.user) === null || _b === void 0 ? void 0 : _b.phone_num) || '',
                    "User Type": item.user_type || '',
                    "Wallet Type": item.wallet_type || '',
                    "Amount": item.amount || '',
                    "Currency": 'YER',
                    "Remark": item.remark || '',
                    "Order Type": item.order_type || '',
                    "Status": item.status || '',
                    "Date": new Date(item.createdAt).toLocaleString(),
                });
            });
            const ws = xlsx.utils.json_to_sheet(exportedData);
            const wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, ws, 'Income Report');
            const buffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=income_report.xlsx');
            res.setHeader('Content-Length', buffer.length.toString());
            return res.send(buffer);
        }
        catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    }
};
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getList", null);
__decorate([
    (0, common_1.Put)('block-user/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "updatedata", null);
__decorate([
    (0, common_1.Get)('getreportcounts'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getreportcounts", null);
__decorate([
    (0, common_1.Get)('income-report-list'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "IncomeReport", null);
__decorate([
    (0, common_1.Patch)('export-income-report'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "exportIncomeReport", null);
ReportController = __decorate([
    (0, common_1.Controller)('/report'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(1, (0, typeorm_1.InjectRepository)(wallet_req_schema_1.Wallet_req)),
    __param(2, (0, typeorm_1.InjectRepository)(user_schema_1.User)),
    __metadata("design:paramtypes", [report_service_1.ReportService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ReportController);
exports.ReportController = ReportController;
//# sourceMappingURL=report.controller.js.map