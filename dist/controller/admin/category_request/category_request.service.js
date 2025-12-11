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
exports.CategoryRequestService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const category_request_schema_1 = require("../../../schema/category_request.schema");
const common_util_1 = require("../../../common/common.util");
const common_messages_1 = require("../../../common/common-messages");
const moment = require("moment-timezone");
let CategoryRequestService = class CategoryRequestService {
    constructor(CategoryRequestModel) {
        this.CategoryRequestModel = CategoryRequestModel;
    }
    async getData(id) {
        try {
            const CategoryRequest = await this.CategoryRequestModel.findOne({ where: { id: id } });
            if (!CategoryRequest) {
                throw new Error(common_messages_1.CommonMessages.notFound('CategoryRequest'));
            }
            return CategoryRequest;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getAllPages(page = 1, pageSize = 10, search = '', status) {
        try {
            const { limit, offset } = common_util_1.default.getPagination(page, pageSize);
            const queryBuilder = this.CategoryRequestModel.createQueryBuilder('category');
            queryBuilder
                .leftJoinAndSelect('category.user', 'user')
                .leftJoinAndSelect('category.parent_category', 'parent_category');
            if (status) {
                queryBuilder.andWhere('category.status = :status', { status });
            }
            if (search) {
                queryBuilder.andWhere(new typeorm_2.Brackets((qb) => {
                    qb.where('user.name LIKE :search', { search: `%${search}%` })
                        .orWhere('category.category_name LIKE :search', { search: `%${search}%` })
                        .orWhere('category.ar_category_name LIKE :search', { search: `%${search}%` });
                }));
            }
            queryBuilder.skip(offset).take(limit);
            queryBuilder.orderBy('category.createdAt', 'DESC');
            const [pages, count] = await queryBuilder.getManyAndCount();
            const paginatedData = common_util_1.default.getPagingData({ count, rows: pages }, page, limit);
            return paginatedData;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getUserAllPages(id, page = 1, pageSize = 10, search = '', status) {
        try {
            const { limit, offset } = common_util_1.default.getPagination(page, pageSize);
            const whereCondition = { user_id: id };
            if (status) {
                whereCondition.status = status;
            }
            if (search) {
                whereCondition.OR = [
                    { user: { name: (0, typeorm_2.Like)(`%${search}%`) } },
                    { category_name: (0, typeorm_2.Like)(`%${search}%`) },
                ];
            }
            const [pages, count] = await this.CategoryRequestModel.findAndCount({
                where: whereCondition,
                relations: ['user'],
                skip: offset,
                take: limit,
                select: {
                    user: { name: true }
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
    async getDatabyid(id) {
        try {
            const CategoryRequest = await this.CategoryRequestModel.findOne({
                where: { id: id },
                relations: ['user', 'parent_category'],
                select: {
                    user: { name: true },
                    parent_category: { category_name: true, ar_category_name: true }
                },
            });
            if (!CategoryRequest) {
                throw new Error(common_messages_1.CommonMessages.notFound('CategoryRequest'));
            }
            return CategoryRequest;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async createData(data) {
        try {
            data.createdAt = moment.tz('Asia/Riyadh').format('YYYY-MM-DD HH:mm:ss');
            let newCategoryRequest = await this.CategoryRequestModel.create(data);
            newCategoryRequest = await this.CategoryRequestModel.save(newCategoryRequest);
            return newCategoryRequest;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async updateData(id, updateData) {
        try {
            let response = await this.CategoryRequestModel.update(id, updateData);
            if (response[0] === 0) {
                throw new Error("No CategoryRequest data was updated.");
            }
            return response;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async deleteData(id) {
        try {
            const CategoryRequest = await this.CategoryRequestModel.findOne({ where: { id: id } });
            if (!CategoryRequest) {
                throw new Error(common_messages_1.CommonMessages.notFound('CategoryRequest'));
            }
            await this.CategoryRequestModel.softDelete(id);
            return CategoryRequest;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async bulkDeletedata(ids) {
        try {
            const categories = await this.CategoryRequestModel.find({ where: { id: (0, typeorm_2.In)(ids) } });
            if (categories.length === 0) {
                throw new Error(common_messages_1.CommonMessages.notFound('Categories'));
            }
            const result = await this.CategoryRequestModel.softDelete(ids);
            return result.affected || 0;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
};
CategoryRequestService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_request_schema_1.CategoryRequest)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CategoryRequestService);
exports.CategoryRequestService = CategoryRequestService;
//# sourceMappingURL=category_request.service.js.map