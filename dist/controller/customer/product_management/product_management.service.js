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
exports.ProductService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_schema_1 = require("../../../schema/product.schema");
const common_util_1 = require("../../../common/common.util");
const options_1 = require("../../../common/options");
const common_messages_1 = require("../../../common/common-messages");
const product_request_schema_1 = require("../../../schema/product_request.schema");
let ProductService = class ProductService {
    constructor(ProductModel, ProductRequestModel) {
        this.ProductModel = ProductModel;
        this.ProductRequestModel = ProductRequestModel;
    }
    async getData(id) {
        try {
            const Product = await this.ProductModel.findOne({ where: { id: id } });
            if (!Product) {
                throw new Error(common_messages_1.CommonMessages.notFound('Product'));
            }
            return Product;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getAllPages(page = 1, pageSize = 10, search = '', category_id, sort) {
        try {
            const { limit, offset } = common_util_1.default.getPagination(page, pageSize);
            const queryBuilder = this.ProductModel.createQueryBuilder('product')
                .where('product.is_active = :is_active', { is_active: true });
            if (category_id) {
                queryBuilder.andWhere('product.category_id = :category_id', { category_id });
            }
            if (search) {
                queryBuilder.andWhere(new typeorm_2.Brackets((qb) => {
                    qb.where('product.product_name LIKE :search', { search: `%${search}%` })
                        .orWhere('product.ar_product_name LIKE :search', { search: `%${search}%` });
                }));
            }
            let order = { createdAt: 'DESC' };
            if (sort == options_1.OptionsMessage.PRODUCT_SORT.price_high_to_low) {
                order = { product_price: 'DESC' };
            }
            else if (sort == options_1.OptionsMessage.PRODUCT_SORT.price_low_to_high) {
                order = { product_price: 'ASC' };
            }
            else if (sort == options_1.OptionsMessage.PRODUCT_SORT.newest) {
                order = { createdAt: 'DESC' };
            }
            queryBuilder.orderBy(order);
            queryBuilder.skip(offset).take(limit);
            const [pages, count] = await queryBuilder.getManyAndCount();
            let product_req_data = await this.ProductRequestModel.find({
                where: { status: options_1.OptionsMessage.PRODUCT_STATUS.Approved }
            });
            product_req_data = JSON.parse(JSON.stringify(product_req_data));
            const filteredPages = pages.filter((product) => product_req_data.some((req) => req.product_id === product.id));
            const filteredCount = filteredPages.length;
            const paginatedData = common_util_1.default.getPagingData({ count: filteredCount, rows: filteredPages }, page, limit);
            paginatedData.data = JSON.parse(JSON.stringify(paginatedData.data));
            for (let element of paginatedData.data) {
                let product_data = product_req_data.filter((o) => o.product_id == element.id);
                element.provider_available = product_data.length || 0;
            }
            return paginatedData;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getDatabyid(id) {
        try {
            const Product = await this.ProductModel.findOne({ where: { id: id } });
            if (!Product) {
                throw new Error(common_messages_1.CommonMessages.notFound('Product'));
            }
            return Product;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async createData(data) {
        try {
            let newProduct = await this.ProductModel.create(data);
            newProduct = await this.ProductModel.save(newProduct);
            return newProduct;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async updateData(id, updateData) {
        try {
            let response = await this.ProductModel.update(id, updateData);
            if (response[0] === 0) {
                throw new Error("No Product data was updated.");
            }
            return response;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async deleteData(id) {
        try {
            const Product = await this.ProductModel.findOne({ where: { id: id } });
            if (!Product) {
                throw new Error(common_messages_1.CommonMessages.notFound('Product'));
            }
            await this.ProductModel.softDelete(id);
            return Product;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
};
ProductService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_schema_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(product_request_schema_1.ProductRequest)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ProductService);
exports.ProductService = ProductService;
//# sourceMappingURL=product_management.service.js.map