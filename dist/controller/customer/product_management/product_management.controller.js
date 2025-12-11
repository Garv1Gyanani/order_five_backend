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
const user_guard_1 = require("../../../authGuard/user.guard");
let ProductController = class ProductController {
    constructor(ProductService) {
        this.ProductService = ProductService;
    }
    async getList(req) {
        try {
            const { page, size, s, category_id, sort } = req.query;
            const data = await this.ProductService.getAllPages(page, size, s, category_id, sort);
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
    async createProfile(createDto) {
        try {
            const data = await this.ProductService.createData(createDto);
            return { status: true, message: common_messages_1.CommonMessages.created_data('Product'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async updateProfile(id, updateData) {
        try {
            const data = await this.ProductService.updateData(id, updateData);
            return { status: true, message: common_messages_1.CommonMessages.updated_data('Product'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async deleteProfile(id) {
        try {
            await this.ProductService.deleteData(id);
            return { status: true, message: common_messages_1.CommonMessages.deleted_data('Product') };
        }
        catch (error) {
            return { status: false, message: error.message };
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
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "createProfile", null);
__decorate([
    (0, common_1.Put)('update/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Delete)('delete/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "deleteProfile", null);
ProductController = __decorate([
    (0, common_1.Controller)('/customer/product'),
    (0, common_1.UseGuards)(user_guard_1.UserGuard),
    __metadata("design:paramtypes", [product_management_service_1.ProductService])
], ProductController);
exports.ProductController = ProductController;
//# sourceMappingURL=product_management.controller.js.map