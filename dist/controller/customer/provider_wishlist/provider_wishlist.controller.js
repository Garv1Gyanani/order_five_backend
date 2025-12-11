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
exports.ProductWishController = void 0;
const common_1 = require("@nestjs/common");
const user_guard_1 = require("../../../authGuard/user.guard");
const provider_wishlist_service_1 = require("./provider_wishlist.service");
let ProductWishController = class ProductWishController {
    constructor(ProductWishListService) {
        this.ProductWishListService = ProductWishListService;
    }
    async createWishlist(createDto, req) {
        try {
            const user_id = req.user.id;
            createDto.user_id = user_id;
            const data = await this.ProductWishListService.createData(createDto);
            return { status: true, message: 'wishlist has been updated', data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getList(req) {
        try {
            const user_id = req.user.id;
            const { page, size, s } = req.query;
            const data = await this.ProductWishListService.getAllPages(page, size, s, user_id);
            return data;
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async reportProvider(createDto, req) {
        try {
            const user_id = req.user.id;
            createDto.user_id = user_id;
            const data = await this.ProductWishListService.reportProvider(createDto);
            return data;
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async reviewProvider(createDto, req) {
        try {
            const user_id = req.user.id;
            createDto.user_id = user_id;
            const data = await this.ProductWishListService.reviewProvider(createDto);
            return { status: true, message: 'review has been updated', data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
};
__decorate([
    (0, common_1.Post)('/wish-provider/create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductWishController.prototype, "createWishlist", null);
__decorate([
    (0, common_1.Get)('/wish-provider/list'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductWishController.prototype, "getList", null);
__decorate([
    (0, common_1.Post)('/report-provider/create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductWishController.prototype, "reportProvider", null);
__decorate([
    (0, common_1.Post)('/provider-review/create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductWishController.prototype, "reviewProvider", null);
ProductWishController = __decorate([
    (0, common_1.Controller)('/customer'),
    (0, common_1.UseGuards)(user_guard_1.UserGuard),
    __metadata("design:paramtypes", [provider_wishlist_service_1.ProductWishListService])
], ProductWishController);
exports.ProductWishController = ProductWishController;
//# sourceMappingURL=provider_wishlist.controller.js.map