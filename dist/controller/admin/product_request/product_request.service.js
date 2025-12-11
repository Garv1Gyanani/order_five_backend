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
const product_request_schema_1 = require("../../../schema/product_request.schema");
const common_util_1 = require("../../../common/common.util");
const common_messages_1 = require("../../../common/common-messages");
const moment = require("moment-timezone");
let ProductRequestService = class ProductRequestService {
    constructor(ProductRequestModel) {
        this.ProductRequestModel = ProductRequestModel;
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
    async getAllPages(page = 1, pageSize = 10, search = '', status, category_id) {
        try {
            const { limit, offset } = common_util_1.default.getPagination(page, pageSize);
            const queryBuilder = this.ProductRequestModel.createQueryBuilder('productRequest')
                .leftJoinAndSelect('productRequest.user', 'user')
                .leftJoinAndSelect('productRequest.product', 'product')
                .leftJoinAndSelect('product.category', 'category')
                .select([
                'productRequest',
                'user.name',
                'user.address_one',
                'user.address_two',
                'product.provider_type',
                'product.product_img',
                'product.product_name',
                'product.description_name',
                'product.ar_product_name',
                'product.ar_description_name',
                'product.delievery_charge',
                'product.product_price',
                'product.product_unit',
                'product.createdAt',
                'product.category_id',
                'category.category_name',
                'category.ar_category_name',
            ])
                .orderBy('productRequest.createdAt', 'DESC')
                .skip(offset)
                .take(limit);
            if (status) {
                queryBuilder.andWhere('productRequest.status = :status', { status });
            }
            if (category_id) {
                queryBuilder.andWhere('product.category_id = :category_id', { category_id });
            }
            if (search) {
                queryBuilder.andWhere('(product.product_name LIKE :search COLLATE utf8mb4_general_ci OR product.ar_product_name LIKE :search COLLATE utf8mb4_general_ci)', { search: `%${search}%` });
            }
            const [pages, count] = await queryBuilder.getManyAndCount();
            const paginatedData = common_util_1.default.getPagingData({ count, rows: pages }, page, limit);
            return paginatedData;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getUserAllPages(user_id, page = 1, pageSize = 10, search = '', status) {
        try {
            const { limit, offset } = common_util_1.default.getPagination(page, pageSize);
            const whereCondition = { user_id: user_id };
            if (status) {
                whereCondition.status = status;
            }
            if (search) {
                whereCondition.user = { name: (0, typeorm_2.Like)(`%${search}%`), };
            }
            const [pages, count] = await this.ProductRequestModel.findAndCount({
                where: whereCondition,
                relations: ['user', 'product', 'product.category'],
                skip: offset,
                take: limit,
                select: {
                    user: { name: true, address_one: true, address_two: true },
                    product: { provider_type: true, product_img: true, product_name: true, description_name: true, ar_product_name: true, ar_description_name: true, delievery_charge: true, product_price: true, product_unit: true, createdAt: true, category_id: true, category: { category_name: true, ar_category_name: true } }
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
            const ProductRequest = await this.ProductRequestModel.findOne({
                where: { id: id },
                relations: ['user', 'product', 'product.category'],
                select: {
                    user: { name: true, address_one: true, address_two: true },
                    product: { provider_type: true, product_img: true, product_name: true, description_name: true, ar_product_name: true, ar_description_name: true, delievery_charge: true, product_price: true, product_unit: true, createdAt: true, category_id: true, category: { category_name: true, ar_category_name: true } }
                },
            });
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
    async bulkDeletedata(ids) {
        try {
            const categories = await this.ProductRequestModel.find({ where: { id: (0, typeorm_2.In)(ids) } });
            if (categories.length === 0) {
                throw new Error(common_messages_1.CommonMessages.notFound('Product'));
            }
            const result = await this.ProductRequestModel.softDelete(ids);
            return result.affected || 0;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
};
ProductRequestService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_request_schema_1.ProductRequest)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProductRequestService);
exports.ProductRequestService = ProductRequestService;
//# sourceMappingURL=product_request.service.js.map