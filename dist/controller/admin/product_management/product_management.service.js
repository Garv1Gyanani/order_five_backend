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
const category_schema_1 = require("../../../schema/category.schema");
const moment = require("moment-timezone");
let ProductService = class ProductService {
    constructor(ProductModel, CategoryModel) {
        this.ProductModel = ProductModel;
        this.CategoryModel = CategoryModel;
    }
    async getData(id) {
        try {
            const Product = await this.ProductModel.findOne({
                where: { id: id },
                relations: ['category'],
                select: {
                    category: { ar_category_name: true, category_name: true }
                },
            });
            if (!Product) {
                throw new Error(common_messages_1.CommonMessages.notFound('Product'));
            }
            return Product;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getAllPages(page = 1, pageSize = 10, search = '') {
        try {
            const { limit, offset } = common_util_1.default.getPagination(page, pageSize);
            const queryBuilder = this.ProductModel.createQueryBuilder('product')
                .select([
                'product',
                'product.product_name',
                'product.provider_type',
                'product.ar_product_name',
                'product.description_name',
                'product.ar_description_name',
                'product.product_price',
                'product.delievery_charge',
                'product.delievery_address',
                'product.product_img',
                'product.product_unit',
                'product.category_id',
                'product.is_active',
                'product.createdAt',
                'product.updatedAt',
            ])
                .orderBy('product.createdAt', 'DESC')
                .skip(offset)
                .take(limit);
            const [pages, count] = await queryBuilder.getManyAndCount();
            const categoryIds = pages.map((product) => product.category_id);
            const categories = await this.CategoryModel.findByIds(categoryIds);
            const parentCategoryIds = categories
                .filter((category) => category.parent_category_id)
                .map((category) => category.parent_category_id);
            const parentCategories = await this.CategoryModel.findByIds(parentCategoryIds);
            const productData = pages.map((product) => {
                const category = categories.find((category) => category.id === product.category_id);
                const parentCategory = parentCategories.find((parentCategory) => parentCategory.id === (category === null || category === void 0 ? void 0 : category.parent_category_id));
                return Object.assign(Object.assign({}, product), { category: {
                        category_name: category === null || category === void 0 ? void 0 : category.category_name,
                        ar_category_name: category === null || category === void 0 ? void 0 : category.ar_category_name,
                    }, parent_category: parentCategory ? parentCategory.category_name : null });
            });
            let filteredData = productData;
            if (search) {
                filteredData = productData.filter((product) => {
                    var _a, _b, _c, _d, _e, _f, _g;
                    const category = product.category || { category_name: '', ar_category_name: '' };
                    const parentCategory = product.parent_category || '';
                    const productName = ((_a = product.product_name) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
                    const arProductName = ((_b = product.ar_product_name) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || '';
                    const descriptionName = ((_c = product.description_name) === null || _c === void 0 ? void 0 : _c.toLowerCase()) || '';
                    const arDescriptionName = ((_d = product.ar_description_name) === null || _d === void 0 ? void 0 : _d.toLowerCase()) || '';
                    const providerType = ((_e = product.provider_type) === null || _e === void 0 ? void 0 : _e.toLowerCase()) || '';
                    const categoryName = ((_f = category.category_name) === null || _f === void 0 ? void 0 : _f.toLowerCase()) || '';
                    const arCategoryName = ((_g = category.ar_category_name) === null || _g === void 0 ? void 0 : _g.toLowerCase()) || '';
                    const parentCategoryName = parentCategory.toLowerCase() || '';
                    return (productName.includes(search.toLowerCase()) ||
                        arProductName.includes(search.toLowerCase()) ||
                        descriptionName.includes(search.toLowerCase()) ||
                        arDescriptionName.includes(search.toLowerCase()) ||
                        providerType.includes(search.toLowerCase()) ||
                        parentCategoryName.includes(search.toLowerCase()) ||
                        categoryName.includes(search.toLowerCase()) ||
                        arCategoryName.includes(search.toLowerCase()));
                });
            }
            return {
                totalItems: count,
                data: filteredData,
                totalPages: Math.ceil(count / pageSize),
                currentPage: page,
            };
        }
        catch (error) {
            console.error('Error fetching products:', error);
            throw new Error('Error fetching products');
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
            data.createdAt = moment.tz('Asia/Riyadh').format('YYYY-MM-DD HH:mm:ss');
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
    async bulkDeletedata(ids) {
        try {
            const categories = await this.ProductModel.find({ where: { id: (0, typeorm_2.In)(ids) } });
            if (categories.length === 0) {
                throw new Error(common_messages_1.CommonMessages.notFound('Product'));
            }
            const result = await this.ProductModel.softDelete(ids);
            return result.affected || 0;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
};
ProductService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_schema_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(category_schema_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ProductService);
exports.ProductService = ProductService;
//# sourceMappingURL=product_management.service.js.map