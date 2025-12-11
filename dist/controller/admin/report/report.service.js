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
exports.ReportService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const common_util_1 = require("../../../common/common.util");
const report_schema_1 = require("../../../schema/report.schema");
const user_schema_1 = require("../../../schema/user.schema");
let ReportService = class ReportService {
    constructor(ReportModel, UserModel) {
        this.ReportModel = ReportModel;
        this.UserModel = UserModel;
    }
    async getAllPages(page = 1, pageSize = 10, search = '') {
        try {
            const { limit, offset } = common_util_1.default.getPagination(page, pageSize);
            const [pages, count] = await this.ReportModel.findAndCount({
                skip: offset,
                take: limit,
                order: { createdAt: 'DESC' },
            });
            const reportsWithUserData = await Promise.all(pages.map(async (report) => {
                const user = await this.UserModel.findOne({
                    where: { id: report.user_id },
                });
                const reported = await this.UserModel.findOne({
                    where: { phone_num: report.phone_num },
                });
                let type = null;
                if ((user === null || user === void 0 ? void 0 : user.user_role) === 2) {
                    type = 'Provider';
                }
                else {
                    type = 'Customer';
                }
                return Object.assign(Object.assign({}, report), { user_name: user === null || user === void 0 ? void 0 : user.name, user_phone: user === null || user === void 0 ? void 0 : user.phone_num, user_profile: user === null || user === void 0 ? void 0 : user.image_url, reported_id: reported === null || reported === void 0 ? void 0 : reported.id, reported_user_name: reported === null || reported === void 0 ? void 0 : reported.name, reported_user_phone: reported === null || reported === void 0 ? void 0 : reported.phone_num, reported_user_profile: reported === null || reported === void 0 ? void 0 : reported.image_url, type });
            }));
            const filteredReports = reportsWithUserData.filter((report) => {
                const searchLower = search.toLowerCase();
                return ((report.user_name && report.user_name.toLowerCase().includes(searchLower)) ||
                    (report.user_phone && report.user_phone.toString().includes(searchLower)) ||
                    (report.reported_user_name && report.reported_user_name.toLowerCase().includes(searchLower)) ||
                    (report.reported_user_phone && report.reported_user_phone.toString().includes(searchLower)));
            });
            const paginatedData = common_util_1.default.getPagingData({ count: filteredReports.length, rows: filteredReports }, page, limit);
            return paginatedData;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async updateData(id, block_day, is_pr_block) {
        try {
            const currentDate = new Date();
            const blockDate = new Date(currentDate);
            blockDate.setDate(currentDate.getDate() + block_day);
            const updateData = {
                is_block: true,
                block_day,
                is_pr_block,
                block_date: blockDate || null,
            };
            let response = await this.UserModel.update(id, updateData);
            if (response[0] === 0) {
                throw new Error('User not found or update failed');
            }
            return { message: 'User updated successfully', response };
        }
        catch (error) {
            throw new Error(`Failed to update user: ${error.message}`);
        }
    }
};
ReportService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(report_schema_1.Report)),
    __param(1, (0, typeorm_1.InjectRepository)(user_schema_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ReportService);
exports.ReportService = ReportService;
//# sourceMappingURL=report.service.js.map