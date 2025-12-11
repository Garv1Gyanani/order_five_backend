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
exports.Required_docController = void 0;
const common_1 = require("@nestjs/common");
const required_doc_service_1 = require("./required_doc.service");
const common_messages_1 = require("../../../common/common-messages");
const admin_guard_1 = require("../../../authGuard/admin.guard");
let Required_docController = class Required_docController {
    constructor(Required_docService) {
        this.Required_docService = Required_docService;
    }
    async getRequired_docList(req) {
        try {
            const { page, size, s, is_active } = req.query;
            const data = await this.Required_docService.getAllPages(page, size, s, is_active);
            return { status: true, message: common_messages_1.CommonMessages.GET_LIST('Document'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getAllRequireddocList(req) {
        try {
            const data = await this.Required_docService.getList();
            return { status: true, message: common_messages_1.CommonMessages.GET_LIST('Document'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getRequired_docbyId(id) {
        try {
            const data = await this.Required_docService.getbyid(id);
            return { status: true, message: common_messages_1.CommonMessages.GET_DATA('Document'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async createdata(req, createRequired_docDto) {
        try {
            const data = await this.Required_docService.createData(createRequired_docDto);
            return { status: true, message: common_messages_1.CommonMessages.created_data('Document'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async updatedata(req, id, updateData) {
        try {
            if (updateData.custom_fields && typeof updateData.custom_fields !== 'string') {
                updateData.custom_fields = JSON.stringify(updateData.custom_fields);
            }
            const data = await this.Required_docService.updateData(id, updateData);
            return { status: true, message: common_messages_1.CommonMessages.updated_data('Document'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async deletedata(id) {
        try {
            await this.Required_docService.deleteData(id);
            return { status: true, message: common_messages_1.CommonMessages.deleted_data('Document') };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async bulkDeletedata(ids) {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                return { status: false, message: `Please select required document for delete`, };
            }
            const deletedCount = await this.Required_docService.bulkDeletedata(ids);
            return { status: true, message: `${deletedCount} required document deleted successfully`, };
        }
        catch (error) {
            return { status: false, message: error.message, };
        }
    }
};
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], Required_docController.prototype, "getRequired_docList", null);
__decorate([
    (0, common_1.Get)('alllist'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], Required_docController.prototype, "getAllRequireddocList", null);
__decorate([
    (0, common_1.Get)('get/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], Required_docController.prototype, "getRequired_docbyId", null);
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Required_docController.prototype, "createdata", null);
__decorate([
    (0, common_1.Put)('update/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], Required_docController.prototype, "updatedata", null);
__decorate([
    (0, common_1.Delete)('delete/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], Required_docController.prototype, "deletedata", null);
__decorate([
    (0, common_1.Delete)('bulkdelete'),
    __param(0, (0, common_1.Body)('ids')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], Required_docController.prototype, "bulkDeletedata", null);
Required_docController = __decorate([
    (0, common_1.Controller)('/requireddoc'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __metadata("design:paramtypes", [required_doc_service_1.Required_docService])
], Required_docController);
exports.Required_docController = Required_docController;
//# sourceMappingURL=required_doc.controller.js.map