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
exports.Required_docService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const required_doc_schema_1 = require("../../../schema/required_doc.schema");
const common_util_1 = require("../../../common/common.util");
const common_messages_1 = require("../../../common/common-messages");
const moment = require("moment-timezone");
let Required_docService = class Required_docService {
    constructor(Required_docModel) {
        this.Required_docModel = Required_docModel;
    }
    async getList() {
        try {
            const Required_docs = await this.Required_docModel.find({
                where: { is_active: true }, order: { createdAt: 'DESC' }
            });
            if (!Required_docs || Required_docs.length === 0) {
                throw new Error(common_messages_1.CommonMessages.notFound('Document'));
            }
            return Required_docs;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getAllPages(page = 1, pageSize = 10, search = '', is_active) {
        try {
            const { limit, offset } = common_util_1.default.getPagination(page, pageSize);
            const queryBuilder = this.Required_docModel.createQueryBuilder('required_doc')
                .skip(offset)
                .take(limit)
                .orderBy('required_doc.createdAt', 'DESC');
            if (search) {
                queryBuilder.andWhere('(required_doc.title LIKE :search COLLATE utf8mb4_general_ci OR required_doc.ar_title LIKE :search COLLATE utf8mb4_general_ci)', { search: `%${search}%` });
            }
            if (is_active && is_active === 'true') {
                queryBuilder.andWhere('required_doc.is_active = :is_active', { is_active: true });
            }
            const [pages, count] = await queryBuilder.getManyAndCount();
            const paginatedData = common_util_1.default.getPagingData({ count, rows: pages }, page, limit);
            return paginatedData;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getbyid(id) {
        try {
            const requiredDoc = await this.Required_docModel.findOne({ where: { id } });
            if ((requiredDoc === null || requiredDoc === void 0 ? void 0 : requiredDoc.custom_fields) && typeof requiredDoc.custom_fields === 'string') {
                requiredDoc.custom_fields = JSON.parse(requiredDoc.custom_fields);
            }
            return requiredDoc;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async createData(data) {
        try {
            if (data.custom_fields && typeof data.custom_fields !== 'string') {
                data.custom_fields = JSON.stringify(data.custom_fields);
            }
            data.createdAt = moment.tz('Asia/Riyadh').format('YYYY-MM-DD HH:mm:ss');
            let newRequired_doc = await this.Required_docModel.create(data);
            newRequired_doc = await this.Required_docModel.save(newRequired_doc);
            return newRequired_doc;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async updateData(id, updateData) {
        try {
            if (updateData.custom_fields && typeof updateData.custom_fields !== 'string') {
                updateData.custom_fields = JSON.stringify(updateData.custom_fields);
            }
            const response = await this.Required_docModel.update(id, updateData);
            return response;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async deleteData(id) {
        try {
            const Required_doc = await this.Required_docModel.findOne({ where: { id: id } });
            if (!Required_doc) {
                throw new Error(common_messages_1.CommonMessages.notFound('Document'));
            }
            await this.Required_docModel.softDelete(id);
            return Required_doc;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async bulkDeletedata(ids) {
        try {
            const categories = await this.Required_docModel.find({ where: { id: (0, typeorm_2.In)(ids) } });
            if (categories.length === 0) {
                throw new Error(common_messages_1.CommonMessages.notFound('wallet request'));
            }
            const result = await this.Required_docModel.softDelete(ids);
            return result.affected || 0;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
};
Required_docService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(required_doc_schema_1.Required_doc)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], Required_docService);
exports.Required_docService = Required_docService;
//# sourceMappingURL=required_doc.service.js.map