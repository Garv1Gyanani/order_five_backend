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
exports.ProductController = void 0;
const common_1 = require("@nestjs/common");
const product_management_service_1 = require("./product_management.service");
const common_messages_1 = require("../../../common/common-messages");
const admin_guard_1 = require("../../../authGuard/admin.guard");
const xlsx = require("xlsx");
const product_schema_1 = require("../../../schema/product.schema");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const category_schema_1 = require("../../../schema/category.schema");
let ProductController = class ProductController {
    constructor(ProductService, ProductModel, CategoryModel) {
        this.ProductService = ProductService;
        this.ProductModel = ProductModel;
        this.CategoryModel = CategoryModel;
    }
    async getList(req) {
        try {
            const { page, size, s } = req.query;
            const data = await this.ProductService.getAllPages(page, size, s);
            return { status: true, message: common_messages_1.CommonMessages.GET_LIST('Product'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getbyId(id) {
        try {
            const data = await this.ProductService.getData(id);
            return { status: true, message: common_messages_1.CommonMessages.GET_DATA('Product'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async createdata(createDto, req) {
        try {
            const data = await this.ProductService.createData(createDto);
            return { status: true, message: common_messages_1.CommonMessages.created_data('Product'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async updatedata(id, updateData, req) {
        try {
            const data = await this.ProductService.updateData(id, updateData);
            return { status: true, message: common_messages_1.CommonMessages.updated_data('Product'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async deletedata(id) {
        try {
            await this.ProductService.deleteData(id);
            return { status: true, message: common_messages_1.CommonMessages.deleted_data('Product') };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async bulkDeletedata(ids) {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                return { status: false, message: `Please select product for delete`, };
            }
            const deletedCount = await this.ProductService.bulkDeletedata(ids);
            return { status: true, message: `${deletedCount} product deleted successfully`, };
        }
        catch (error) {
            return { status: false, message: error.message, };
        }
    }
    async exportProductsToXLSX(req, res) {
        try {
            const { search = '' } = req.query;
            const queryBuilder = this.ProductModel.createQueryBuilder('product')
                .select([
                'product.id',
                'product.product_name',
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
                .orderBy('product.createdAt', 'DESC');
            const products = await queryBuilder.getMany();
            const categoryIds = products.map((product) => product.category_id);
            const categories = await this.CategoryModel.findByIds(categoryIds);
            const parentCategoryIds = categories.map((category) => category.parent_category_id).filter(Boolean);
            const parentCategories = await this.CategoryModel.findByIds(parentCategoryIds);
            const exportedData = products.map((product) => {
                const category = categories.find((c) => c.id === product.category_id);
                const parentCategory = parentCategories.find((pc) => pc.id === (category === null || category === void 0 ? void 0 : category.parent_category_id));
                return {
                    "ID": product.id || '',
                    "Product Name": product.product_name || '',
                    "Arabic Product Name": product.ar_product_name || '',
                    "Description": product.description_name || '',
                    "Arabic Description": product.ar_description_name || '',
                    "Price": product.product_price || '',
                    "Delivery Charge": product.delievery_charge || '',
                    "Delivery Address": product.delievery_address || '',
                    "Product Image": product.product_img || '',
                    "Unit": product.product_unit || '',
                    "Category": (category === null || category === void 0 ? void 0 : category.category_name) || '',
                    "Parent Category": (parentCategory === null || parentCategory === void 0 ? void 0 : parentCategory.category_name) || '',
                    "Created At": new Date(product.createdAt).toLocaleString(),
                    "Updated At": new Date(product.updatedAt).toLocaleString(),
                    "Is Active": product.is_active ? 'Active' : 'Inactive',
                };
            });
            const ws = xlsx.utils.json_to_sheet(exportedData);
            const wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, ws, 'Product List');
            const buffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=product_list_export.xlsx');
            res.setHeader('Content-Length', buffer.length.toString());
            return res.send(buffer);
        }
        catch (error) {
            console.error('Error exporting products:', error);
            return res.status(500).json({ status: false, message: error.message });
        }
    }
};
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getList", null);
__decorate([
    (0, common_1.Get)('get/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getbyId", null);
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "createdata", null);
__decorate([
    (0, common_1.Put)('update/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "updatedata", null);
__decorate([
    (0, common_1.Delete)('delete/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "deletedata", null);
__decorate([
    (0, common_1.Delete)('bulkdelete'),
    __param(0, (0, common_1.Body)('ids')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "bulkDeletedata", null);
__decorate([
    (0, common_1.Patch)('export'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "exportProductsToXLSX", null);
ProductController = __decorate([
    (0, common_1.Controller)('/product'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(1, (0, typeorm_2.InjectRepository)(product_schema_1.Product)),
    __param(2, (0, typeorm_2.InjectRepository)(category_schema_1.Category)),
    __metadata("design:paramtypes", [product_management_service_1.ProductService,
        typeorm_1.Repository,
        typeorm_1.Repository])
], ProductController);
exports.ProductController = ProductController;
//# sourceMappingURL=product_management.controller.js.map