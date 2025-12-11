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
const common_messages_1 = require("../../../common/common-messages");
let ProductService = class ProductService {
    constructor(ProductModel) {
        this.ProductModel = ProductModel;
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
    async getAllPages(page = 1, pageSize = 10, search = '', category_id) {
        try {
            const { limit, offset } = common_util_1.default.getPagination(page, pageSize);
            let wherequery = { is_active: 1 };
            if (category_id) {
                wherequery.category_id = category_id;
            }
            const [pages, count] = await this.ProductModel.findAndCount({
                where: wherequery,
                skip: offset,
                take: limit,
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
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProductService);
exports.ProductService = ProductService;
//# sourceMappingURL=product_management.service.js.map