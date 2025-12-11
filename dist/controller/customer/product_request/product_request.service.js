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
            const whereCondition = { is_active: true };
            if (status) {
                whereCondition.status = status;
            }
            if (category_id) {
                whereCondition.product = { category_id };
            }
            if (search) {
                whereCondition.product = { product_name: (0, typeorm_2.Like)(`%${search}%`), };
            }
            const [pages, count] = await this.ProductRequestModel.findAndCount({
                where: whereCondition,
                relations: ['user', 'product'],
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
            const ProductRequest = await this.ProductRequestModel.findOne({ where: { id: id } });
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
};
ProductRequestService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_request_schema_1.ProductRequest)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProductRequestService);
exports.ProductRequestService = ProductRequestService;
//# sourceMappingURL=product_request.service.js.map