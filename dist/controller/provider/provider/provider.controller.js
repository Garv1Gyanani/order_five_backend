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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const provider_service_1 = require("./provider.service");
const common_messages_1 = require("../../../common/common-messages");
const provider_guard_1 = require("../../../authGuard/provider.guard");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
let UserController = class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    async UserDocument(UserDocument, id) {
        try {
            const data = await this.userService.GetUserDocument(id);
            return { status: true, message: common_messages_1.CommonMessages.upload_data('Document'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async MultiUploadDocument(req) {
        try {
            const user_id = req.user.id;
            const documents = req.body.documents;
            const is_resubmit = req.body.is_resubmit;
            if (!Array.isArray(documents) || documents.length === 0) {
                return { status: false, message: 'No documents provided for upload.' };
            }
            const data = await this.userService.createMultiUserDocument(documents, is_resubmit, user_id);
            return { status: true, message: common_messages_1.CommonMessages.upload_data('Document'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async uploaddocument(UserDocument) {
        try {
            const data = await this.userService.createUserDocument(UserDocument);
            return { status: true, message: common_messages_1.CommonMessages.upload_data('Document'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async UpdateUserDocument(UserDocument, id) {
        try {
            const data = await this.userService.UpdateUserDocument(id, UserDocument);
            return { status: true, message: common_messages_1.CommonMessages.upload_data('Document'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getUserProfile(req) {
        try {
            const user_id = req.user.id;
            const data = await this.userService.getUserData(user_id);
            return { status: true, message: common_messages_1.CommonMessages.GET_DATA('Profile'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async updateUserProfile(id, updateData) {
        try {
            const data = await this.userService.updateUserData(id, updateData);
            return { status: true, message: common_messages_1.CommonMessages.updated_data('Provider'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async updateUserDataStatus(req, updateData) {
        try {
            const user_id = req.user.id;
            const data = await this.userService.updateUserDataStatus(user_id, updateData);
            return { status: true, message: common_messages_1.CommonMessages.updated_data('Provider'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async uploadFiles(file) {
        try {
            let url = `${process.env.API_BASE_URL}${file.filename}`;
            return { status: true, message: 'File uploaded successfully', url, data: file };
        }
        catch (error) {
            ;
            return { status: false, message: 'Error uploading file' };
        }
    }
    async reportCustomer(createDto, req) {
        try {
            const user_id = req.user.id;
            createDto.user_id = user_id;
            const data = await this.userService.reportCustomer(createDto);
            return data;
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async reviewCustomer(createDto, req) {
        try {
            const user_id = req.user.id;
            createDto.user_id = user_id;
            const data = await this.userService.reviewCustomer(createDto);
            return { status: true, message: 'review has been updated', data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getAllNotificationPages(req) {
        try {
            const provider = req.user.id;
            const { page, size, s } = req.query;
            const data = await this.userService.getAllNotificationPages(provider, page, size, s);
            return { status: true, message: common_messages_1.CommonMessages.GET_LIST('notification'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
};
__decorate([
    (0, common_1.Get)('getuserdocument/:id'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "UserDocument", null);
__decorate([
    (0, common_1.Post)('multiuploaddocument'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "MultiUploadDocument", null);
__decorate([
    (0, common_1.Post)('uploaddocument'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "uploaddocument", null);
__decorate([
    (0, common_1.Put)('updateuserdocument/:id'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "UpdateUserDocument", null);
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUserProfile", null);
__decorate([
    (0, common_1.Put)('/profile/update/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateUserProfile", null);
__decorate([
    (0, common_1.Put)('/current-status'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateUserDataStatus", null);
__decorate([
    (0, common_1.Post)('/uploadfile'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, callback) => {
                const uniqueFilename = `${new Date().getTime()}-${file.originalname.replace(/ /g, "_")}`;
                callback(null, uniqueFilename);
            }
        })
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "uploadFiles", null);
__decorate([
    (0, common_1.Post)('/report-customer/create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "reportCustomer", null);
__decorate([
    (0, common_1.Post)('/customer-review/create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "reviewCustomer", null);
__decorate([
    (0, common_1.Get)('notification-list'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getAllNotificationPages", null);
UserController = __decorate([
    (0, common_1.Controller)('/provider'),
    (0, common_1.UseGuards)(provider_guard_1.ProviderGuard),
    __metadata("design:paramtypes", [provider_service_1.UserService])
], UserController);
exports.UserController = UserController;
//# sourceMappingURL=provider.controller.js.map