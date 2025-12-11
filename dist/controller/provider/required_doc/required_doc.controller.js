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
const provider_guard_1 = require("../../../authGuard/provider.guard");
let Required_docController = class Required_docController {
    constructor(Required_docService) {
        this.Required_docService = Required_docService;
    }
    async getRequired_docList(req) {
        try {
            const { page, size, s } = req.query;
            const data = await this.Required_docService.getAllPages(page, size, s);
            return { status: true, message: common_messages_1.CommonMessages.GET_LIST('Provider'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getRequired_docbyId(id) {
        try {
            const data = await this.Required_docService.getbyid(id);
            return { status: true, message: common_messages_1.CommonMessages.GET_DATA('Provider'), data };
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
], Required_docController.prototype, "getRequired_docList", null);
__decorate([
    (0, common_1.Get)('get/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], Required_docController.prototype, "getRequired_docbyId", null);
Required_docController = __decorate([
    (0, common_1.Controller)('/provider/requireddoc'),
    (0, common_1.UseGuards)(provider_guard_1.ProviderGuard),
    __metadata("design:paramtypes", [required_doc_service_1.Required_docService])
], Required_docController);
exports.Required_docController = Required_docController;
//# sourceMappingURL=required_doc.controller.js.map