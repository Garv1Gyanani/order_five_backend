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
    async getAll(cattype) {
        try {
            let whereCondition = { is_active: true };
            if (cattype) {
                whereCondition.provider_type = cattype;
            }
            const categories = await this.CategoryModel.find({
                where: whereCondition,
                order: { id: "ASC" },
            });
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
    async getAllPages(page = 1, pageSize = 10, search = '', cattype) {
        try {
            const { limit, offset } = common_util_1.default.getPagination(page, pageSize);
            const queryBuilder = this.CategoryModel.createQueryBuilder('category')
                .where('category.is_active = :isActive', { isActive: 1 })
                .orderBy('category.createdAt', 'DESC')
                .skip(offset)
                .take(limit);
            if (cattype) {
                queryBuilder.andWhere('category.provider_type = :providerType', { providerType: cattype });
            }
            if (search) {
                queryBuilder.andWhere('(category.name LIKE :search COLLATE utf8mb4_general_ci OR category.ar_category_name LIKE :search COLLATE utf8mb4_general_ci)', { search: `%${search}%` });
            }
            const [pages, count] = await queryBuilder.getManyAndCount();
            return {
                totalItems: count,
                data: pages,
                totalPages: Math.ceil(count / pageSize),
                currentPage: Number(page),
            };
        }
        catch (error) {
            console.error('Error fetching categories:', error);
            throw new Error(error.message);
        }
    }
    async getDatabyid(id) {
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
    async createData(data) {
        try {
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
};
CategoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_schema_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CategoryService);
exports.CategoryService = CategoryService;
//# sourceMappingURL=category_management.service.js.map