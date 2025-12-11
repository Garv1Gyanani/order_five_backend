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
exports.CategoryController = void 0;
const common_1 = require("@nestjs/common");
const category_management_service_1 = require("./category_management.service");
const common_messages_1 = require("../../../common/common-messages");
const admin_guard_1 = require("../../../authGuard/admin.guard");
const xlsx = require("xlsx");
const typeorm_1 = require("@nestjs/typeorm");
const category_schema_1 = require("../../../schema/category.schema");
const typeorm_2 = require("typeorm");
const category_request_schema_1 = require("../../../schema/category_request.schema");
let CategoryController = class CategoryController {
    constructor(CategoryService, CategoryModel, CategoryRequest) {
        this.CategoryService = CategoryService;
        this.CategoryModel = CategoryModel;
        this.CategoryRequest = CategoryRequest;
    }
    async getList(req) {
        try {
            const { page, size, s } = req.query;
            const data = await this.CategoryService.getAllPages(page, size, s);
            return { status: true, message: common_messages_1.CommonMessages.GET_LIST('Category'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getbyId(id) {
        try {
            const data = await this.CategoryService.getData(id);
            return { status: true, message: common_messages_1.CommonMessages.GET_DATA('Category'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async createdata(createDto, req) {
        try {
            const data = await this.CategoryService.createData(createDto);
            return { status: true, message: common_messages_1.CommonMessages.created_data('Category'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async updatedata(id, updateData, req) {
        try {
            const data = await this.CategoryService.updateData(id, updateData);
            return { status: true, message: common_messages_1.CommonMessages.updated_data('Category'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async deletedata(id) {
        try {
            await this.CategoryService.deleteData(id);
            return { status: true, message: common_messages_1.CommonMessages.deleted_data('Category') };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async bulkDeletedata(ids) {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                return { status: false, message: `Please select categories for delete`, };
            }
            const deletedCount = await this.CategoryService.bulkDeletedata(ids);
            return { status: true, message: `${deletedCount} categories deleted successfully`, };
        }
        catch (error) {
            return { status: false, message: error.message, };
        }
    }
    async getAllList(req) {
        try {
            let { provider_type } = req.query;
            const data = await this.CategoryService.getAll(provider_type);
            return { status: true, message: common_messages_1.CommonMessages.GET_LIST('Category'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async exportListToXLSX(req, res) {
        try {
            const queryBuilder = this.CategoryModel.createQueryBuilder('category');
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
            const data = await queryBuilder.getMany();
            const exportedData = data.map((item) => {
                var _a, _b;
                return ({
                    "ID": item.id || '',
                    "Category Name": item.category_name || '',
                    "Arabic Category Name": item.ar_category_name || '',
                    "Provider Type": item.provider_type || '',
                    "Category Image": item.category_img || '',
                    "Parent Category Name": ((_a = item.parent) === null || _a === void 0 ? void 0 : _a.category_name) || '',
                    "Parent Arabic Category Name": ((_b = item.parent) === null || _b === void 0 ? void 0 : _b.ar_category_name) || '',
                    "Created At": new Date(item.createdAt).toLocaleString(),
                    "Is Active": item.is_active ? 'Active' : 'Inactive',
                });
            });
            const ws = xlsx.utils.json_to_sheet(exportedData);
            const wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, ws, 'Category List');
            const buffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=category_list_export.xlsx');
            res.setHeader('Content-Length', buffer.length.toString());
            return res.send(buffer);
        }
        catch (error) {
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
], CategoryController.prototype, "getList", null);
__decorate([
    (0, common_1.Get)('get/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "getbyId", null);
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "createdata", null);
__decorate([
    (0, common_1.Put)('update/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "updatedata", null);
__decorate([
    (0, common_1.Delete)('delete/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "deletedata", null);
__decorate([
    (0, common_1.Delete)('bulkdelete'),
    __param(0, (0, common_1.Body)('ids')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "bulkDeletedata", null);
__decorate([
    (0, common_1.Get)('alllist'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "getAllList", null);
__decorate([
    (0, common_1.Patch)('export'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "exportListToXLSX", null);
CategoryController = __decorate([
    (0, common_1.Controller)('/category'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(1, (0, typeorm_1.InjectRepository)(category_schema_1.Category)),
    __param(2, (0, typeorm_1.InjectRepository)(category_request_schema_1.CategoryRequest)),
    __metadata("design:paramtypes", [category_management_service_1.CategoryService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CategoryController);
exports.CategoryController = CategoryController;
//# sourceMappingURL=category_management.controller.js.map