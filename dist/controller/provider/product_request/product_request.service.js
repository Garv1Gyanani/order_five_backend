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
exports.ProductRequestService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const common_util_1 = require("../../../common/common.util");
const common_messages_1 = require("../../../common/common-messages");
const category_schema_1 = require("../../../schema/category.schema");
const product_request_schema_1 = require("../../../schema/product_request.schema");
const moment = require("moment-timezone");
let ProductRequestService = class ProductRequestService {
    constructor(ProductRequestModel, CategoryModel) {
        this.ProductRequestModel = ProductRequestModel;
        this.CategoryModel = CategoryModel;
    }
    async getData(id) {
        try {
            const ProductRequest = await this.ProductRequestModel.findOne({ where: { id: id }, relations: ['user', 'product'], });
            if (!ProductRequest) {
                throw new Error(common_messages_1.CommonMessages.notFound('ProductRequest'));
            }
            return ProductRequest;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getAllPages(user_id, page = 1, pageSize = 10, search = '', status, cattype) {
        try {
            const { limit, offset } = common_util_1.default.getPagination(page, pageSize);
            const whereCondition = { user_id, is_active: true };
            if (status && status !== '') {
                whereCondition.status = status;
            }
            if (cattype && cattype !== '') {
                whereCondition.product = { category_id: cattype };
            }
            if (search && search !== '') {
                whereCondition.user = {
                    name: (0, typeorm_2.Like)(`%${search}%`),
                };
            }
            const [pages, count] = await this.ProductRequestModel.findAndCount({
                where: whereCondition,
                relations: ['user', 'product'],
                skip: offset,
                take: limit,
                select: {
                    user: { name: true },
                },
                order: { createdAt: 'DESC' },
            });
            const filteredPages = pages.filter((page) => {
                return page.product && page.product.deletedAt === null;
            });
            const filteredCount = filteredPages.length;
            const paginatedData = common_util_1.default.getPagingData({ count: filteredCount, rows: filteredPages }, page, limit);
            return paginatedData;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getDatabyid(id) {
        try {
            const ProductRequest = await this.ProductRequestModel.findOne({ where: { id: id }, relations: ['user', 'product'], });
            if (!ProductRequest) {
                throw new Error(common_messages_1.CommonMessages.notFound('ProductRequest'));
            }
            return ProductRequest;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async createData(data) {
        try {
            data.createdAt = moment.tz('Asia/Riyadh').format('YYYY-MM-DD HH:mm:ss');
            let newProductRequest = await this.ProductRequestModel.create(data);
            newProductRequest = await this.ProductRequestModel.save(newProductRequest);
            return newProductRequest;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async updateData(id, updateData) {
        try {
            let response = await this.ProductRequestModel.update(id, updateData);
            if (response[0] === 0) {
                throw new Error("No ProductRequest data was updated.");
            }
            return response;
        }
        catch (error) {
            console.log(error);
            throw new Error(error.message);
        }
    }
    async deleteData(id) {
        try {
            const ProductRequest = await this.ProductRequestModel.findOne({ where: { id: id } });
            if (!ProductRequest) {
                throw new Error(common_messages_1.CommonMessages.notFound('ProductRequest'));
            }
            await this.ProductRequestModel.softDelete(id);
            return ProductRequest;
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
ProductRequestService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_request_schema_1.ProductRequest)),
    __param(1, (0, typeorm_1.InjectRepository)(category_schema_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ProductRequestService);
exports.ProductRequestService = ProductRequestService;
//# sourceMappingURL=product_request.service.js.map