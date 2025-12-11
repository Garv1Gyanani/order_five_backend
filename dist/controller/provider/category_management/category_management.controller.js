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
const provider_guard_1 = require("../../../authGuard/provider.guard");
let CategoryController = class CategoryController {
    constructor(CategoryService) {
        this.CategoryService = CategoryService;
    }
    async getList(req) {
        try {
            const { page, size, s, cattype } = req.query;
            const data = await this.CategoryService.getAllPages(page, size, s, cattype);
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
    async getAllList(req) {
        try {
            let { cattype } = req.query;
            const data = await this.CategoryService.getAll(cattype);
            return { status: true, message: common_messages_1.CommonMessages.GET_LIST('Category'), data };
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
], CategoryController.prototype, "getList", null);
__decorate([
    (0, common_1.Get)('get/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "getbyId", null);
__decorate([
    (0, common_1.Get)('alllist'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "getAllList", null);
CategoryController = __decorate([
    (0, common_1.Controller)('/provider/category'),
    (0, common_1.UseGuards)(provider_guard_1.ProviderGuard),
    __metadata("design:paramtypes", [category_management_service_1.CategoryService])
], CategoryController);
exports.CategoryController = CategoryController;
//# sourceMappingURL=category_management.controller.js.map