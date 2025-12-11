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
exports.CustomerController = void 0;
const common_1 = require("@nestjs/common");
const customer_service_1 = require("./customer.service");
const common_messages_1 = require("../../../common/common-messages");
const admin_guard_1 = require("../../../authGuard/admin.guard");
const xlsx = require("xlsx");
const typeorm_1 = require("@nestjs/typeorm");
const user_schema_1 = require("../../../schema/user.schema");
const typeorm_2 = require("typeorm");
const options_1 = require("../../../common/options");
const rating_schema_1 = require("../../../schema/rating.schema");
let CustomerController = class CustomerController {
    constructor(userService, UserModel, RatingModel) {
        this.userService = userService;
        this.UserModel = UserModel;
        this.RatingModel = RatingModel;
    }
    async getList(req) {
        try {
            const { page, size, s, is_active } = req.query;
            const data = await this.userService.getAllPages(page, size, s, is_active);
            return { status: true, message: common_messages_1.CommonMessages.GET_LIST('Customer'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getallList(req) {
        try {
            const data = await this.UserModel.find({ where: { user_role: options_1.OptionsMessage.USER_ROLE.CUSTOMER } });
            return { status: true, message: common_messages_1.CommonMessages.GET_LIST('Customer'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getbyId(id) {
        try {
            const data = await this.userService.getData(id);
            return { status: true, message: common_messages_1.CommonMessages.GET_DATA('Customer'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async createdata(createDto) {
        try {
            const data = await this.userService.createData(createDto);
            return { status: true, message: common_messages_1.CommonMessages.created_data('Customer'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async updatedata(id, updateData) {
        try {
            const data = await this.userService.updateData(id, updateData);
            return { status: true, message: common_messages_1.CommonMessages.updated_data('Customer'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async deletedata(id) {
        try {
            await this.userService.deleteData(id);
            return { status: true, message: common_messages_1.CommonMessages.deleted_data('Customer') };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async bulkDeletedata(ids) {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                return { status: false, message: `Please select customer for delete`, };
            }
            const deletedCount = await this.userService.bulkDeletedata(ids);
            return { status: true, message: `${deletedCount} customer deleted successfully`, };
        }
        catch (error) {
            return { status: false, message: error.message, };
        }
    }
    async exportListToXLSX(req, res) {
        try {
            const { s = '', is_active = 'all' } = req.query;
            let whereConditions = { user_role: options_1.OptionsMessage.USER_ROLE.CUSTOMER };
            if (s) {
                whereConditions.name = (0, typeorm_2.Like)(`%${s}%`);
            }
            if (is_active !== undefined && is_active !== 'all' && is_active !== 'All') {
                whereConditions.is_active = is_active === '1' ? true : is_active === '0' ? false : whereConditions.is_active;
            }
            const data = await this.UserModel.find({ where: whereConditions, order: { createdAt: 'DESC' } });
            const customerIds = data.map((customer) => customer.id);
            const ratings = await this.RatingModel.createQueryBuilder('ratings')
                .select('ratings.customer_id', 'customerId')
                .addSelect('AVG(ratings.rating)', 'averageRating')
                .addSelect('COUNT(ratings.rating)', 'ratingCount')
                .where('ratings.customer_id IN (:...customerIds)', { customerIds })
                .groupBy('ratings.customer_id')
                .getRawMany();
            const roundToHalf = (value) => Math.round(value * 2) / 2;
            const ratingsMap = ratings.reduce((acc, rating) => {
                acc[rating.customerId] = {
                    averageRating: roundToHalf(parseFloat(rating.averageRating)),
                    ratingCount: parseInt(rating.ratingCount, 10),
                };
                return acc;
            }, {});
            const exportedData = data.map((item) => {
                var _a, _b;
                return ({
                    "Name": (item === null || item === void 0 ? void 0 : item.name) || '',
                    "Phone": (item === null || item === void 0 ? void 0 : item.phone_num) || '',
                    "Address 1": (item === null || item === void 0 ? void 0 : item.address_one) || '',
                    "Address 2": (item === null || item === void 0 ? void 0 : item.address_two) || '',
                    "Available Balance": (item === null || item === void 0 ? void 0 : item.wallet_balance) || '',
                    "Rating": ((_a = ratingsMap[item.id]) === null || _a === void 0 ? void 0 : _a.averageRating) || 0,
                    "Rating Count": ((_b = ratingsMap[item.id]) === null || _b === void 0 ? void 0 : _b.ratingCount) || 0,
                    "Is Active": (item === null || item === void 0 ? void 0 : item.is_active) ? 'Active' : 'Inactive',
                    "Created At": new Date(item === null || item === void 0 ? void 0 : item.createdAt).toLocaleString(),
                });
            });
            const ws = xlsx.utils.json_to_sheet(exportedData);
            const wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, ws, 'User List');
            const buffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=user_list_export.xlsx');
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
], CustomerController.prototype, "getList", null);
__decorate([
    (0, common_1.Get)('alllist'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "getallList", null);
__decorate([
    (0, common_1.Get)('get/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "getbyId", null);
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "createdata", null);
__decorate([
    (0, common_1.Put)('update/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "updatedata", null);
__decorate([
    (0, common_1.Delete)('delete/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "deletedata", null);
__decorate([
    (0, common_1.Delete)('bulkdelete'),
    __param(0, (0, common_1.Body)('ids')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "bulkDeletedata", null);
__decorate([
    (0, common_1.Patch)('export'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "exportListToXLSX", null);
CustomerController = __decorate([
    (0, common_1.Controller)('/customer'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(1, (0, typeorm_1.InjectRepository)(user_schema_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(rating_schema_1.Rating)),
    __metadata("design:paramtypes", [customer_service_1.CustomerService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CustomerController);
exports.CustomerController = CustomerController;
//# sourceMappingURL=customer.controller.js.map