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
const category_schema_1 = require("../../../schema/category.schema");
const moment = require("moment-timezone");
let CategoryRequestService = class CategoryRequestService {
    constructor(CategoryRequestModel, CategoryModel) {
        this.CategoryRequestModel = CategoryRequestModel;
        this.CategoryModel = CategoryModel;
    }
    async getData(id) {
        try {
            const CategoryRequest = await this.CategoryModel.findOne({ where: { id: id } });
            if (!CategoryRequest) {
                throw new Error(common_messages_1.CommonMessages.notFound('Category'));
            }
            return CategoryRequest;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getAllPages(page = 1, pageSize = 10, search = '', status, cattype) {
        try {
            const { limit, offset } = common_util_1.default.getPagination(page, pageSize);
            const whereCondition = {};
            if (status) {
                whereCondition.status = status;
            }
            if (cattype) {
                whereCondition.provider_type = cattype;
            }
            if (search) {
                whereCondition.user = {
                    name: (0, typeorm_2.Like)(`%${search}%`),
                };
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
    async getAll() {
        try {
            const categories = await this.getCategoryHierarchy();
            return categories;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getCategoryHierarchy(parentId = null, visited = new Set()) {
        const categories = await this.CategoryModel.find({
            where: { parent_category_id: parentId },
            order: { id: "ASC" },
        });
        const categoryData = [];
        for (const category of categories) {
            if (visited.has(category.id))
                continue;
            visited.add(category.id);
            const subcategories = await this.getCategoryHierarchy(category.id, visited);
            categoryData.push({
                id: category.id,
                ar_category_name: category.ar_category_name,
                category_name: category.category_name,
                subcategories: subcategories,
            });
        }
        return categoryData;
    }
};
CategoryRequestService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_request_schema_1.CategoryRequest)),
    __param(1, (0, typeorm_1.InjectRepository)(category_schema_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CategoryRequestService);
exports.CategoryRequestService = CategoryRequestService;
//# sourceMappingURL=category_request.service.js.map