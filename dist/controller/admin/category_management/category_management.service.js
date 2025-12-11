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
exports.CategoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const category_schema_1 = require("../../../schema/category.schema");
const common_util_1 = require("../../../common/common.util");
const common_messages_1 = require("../../../common/common-messages");
const moment = require("moment-timezone");
let CategoryService = class CategoryService {
    constructor(CategoryModel) {
        this.CategoryModel = CategoryModel;
    }
    async getData(id) {
        try {
            const Category = await this.CategoryModel.findOne({ where: { id: id } });
            if (!Category) {
                throw new Error(common_messages_1.CommonMessages.notFound('Category'));
            }
            return Category;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getAll(provider_type) {
        try {
            const categories = await this.getCategoryHierarchy(provider_type);
            return categories;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getCategoryHierarchy(provider_type, parentId = null, visited = new Set()) {
        const categories = await this.CategoryModel.find({
            where: { provider_type, parent_category_id: parentId },
            order: { id: "ASC" },
        });
        const categoryData = [];
        for (const category of categories) {
            if (visited.has(category.id))
                continue;
            visited.add(category.id);
            const subcategories = await this.getCategoryHierarchy(provider_type, category.id, visited);
            categoryData.push({
                id: category.id,
                ar_category_name: category.ar_category_name,
                category_name: category.category_name,
                subcategories: subcategories,
            });
        }
        return categoryData;
    }
    async getAllPages(page = 1, pageSize = 10, search = '') {
        try {
            const { limit, offset } = common_util_1.default.getPagination(page, pageSize);
            const queryBuilder = this.CategoryModel.createQueryBuilder('category');
            if (search) {
                queryBuilder.where(`(category.category_name LIKE :search COLLATE utf8mb4_general_ci OR category.ar_category_name LIKE :search COLLATE utf8mb4_general_ci)`, { search: `%${search}%` });
            }
            queryBuilder.skip(offset).take(limit).orderBy('category.createdAt', 'DESC');
            queryBuilder.leftJoinAndSelect('category.parent', 'parent');
            queryBuilder.select([
                'category.id',
                'category.category_name',
                'category.ar_category_name',
                'category.provider_type',
                'category.category_img',
                'category.createdAt',
                'category.is_active',
                'parent.category_name',
                'parent.ar_category_name',
            ]);
            const [pages, count] = await queryBuilder.getManyAndCount();
            const paginatedData = common_util_1.default.getPagingData({ count, rows: pages }, page, limit);
            return paginatedData;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getDatabyid(id) {
        try {
            const Category = await this.CategoryModel.findOne({
                where: { id: id },
                relations: ['parent'],
                select: {
                    parent: { ar_category_name: true, category_name: true }
                },
            });
            if (!Category) {
                throw new Error(common_messages_1.CommonMessages.notFound('Category'));
            }
            return Category;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async createData(data) {
        try {
            data.createdAt = moment.tz('Asia/Riyadh').format('YYYY-MM-DD HH:mm:ss');
            let newCategory = await this.CategoryModel.create(data);
            newCategory = await this.CategoryModel.save(newCategory);
            return newCategory;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async updateData(id, updateData) {
        try {
            let response = await this.CategoryModel.update(id, updateData);
            if (response[0] === 0) {
                throw new Error("No Category data was updated.");
            }
            return response;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async deleteData(id) {
        try {
            const Category = await this.CategoryModel.findOne({ where: { id: id } });
            if (!Category) {
                throw new Error(common_messages_1.CommonMessages.notFound('Category'));
            }
            await this.CategoryModel.softDelete(id);
            return Category;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async bulkDeletedata(ids) {
        try {
            const categories = await this.CategoryModel.find({ where: { id: (0, typeorm_2.In)(ids) } });
            if (categories.length === 0) {
                throw new Error(common_messages_1.CommonMessages.notFound('Categories'));
            }
            const result = await this.CategoryModel.softDelete(ids);
            return result.affected || 0;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
};
CategoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_schema_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CategoryService);
exports.CategoryService = CategoryService;
//# sourceMappingURL=category_management.service.js.map