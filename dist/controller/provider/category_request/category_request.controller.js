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
exports.CategoryRequestController = void 0;
const common_1 = require("@nestjs/common");
const category_request_service_1 = require("./category_request.service");
const common_messages_1 = require("../../../common/common-messages");
const provider_guard_1 = require("../../../authGuard/provider.guard");
const common_util_1 = require("../../../common/common.util");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_schema_1 = require("../../../schema/user.schema");
const setting_schema_1 = require("../../../schema/setting.schema");
const email_templates_schema_1 = require("../../../schema/email_templates.schema");
const options_1 = require("../../../common/options");
let CategoryRequestController = class CategoryRequestController {
    constructor(CategoryReqService, UserModel, SettingModel, EmailTemplateModel) {
        this.CategoryReqService = CategoryReqService;
        this.UserModel = UserModel;
        this.SettingModel = SettingModel;
        this.EmailTemplateModel = EmailTemplateModel;
    }
    async getList(req) {
        try {
            const { page, size, s, status, cattype } = req.query;
            const data = await this.CategoryReqService.getAllPages(page, size, s, status, cattype);
            return { status: true, message: common_messages_1.CommonMessages.GET_LIST('CategoryRequest'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getbyId(id) {
        try {
            const data = await this.CategoryReqService.getData(id);
            return { status: true, message: common_messages_1.CommonMessages.GET_DATA('CategoryRequest'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async createProfile(createDto, req) {
        try {
            let { local } = req.query;
            if (local == options_1.OptionsMessage.LOCAL_TYPE.ARABIC) {
                createDto.ar_category_name = createDto.category_name;
                delete createDto.category_name;
            }
            let user_id = req.user.id;
            createDto.user_id = user_id;
            const data = await this.CategoryReqService.createData(createDto);
            if (data) {
                const adminuser = await this.UserModel.findOne({ where: { user_role: options_1.OptionsMessage.USER_ROLE.ADMIN } });
                const user = await this.UserModel.findOne({ where: { id: user_id } });
                if (adminuser) {
                    let smtpSettings = await this.SettingModel.find();
                    smtpSettings = JSON.parse(JSON.stringify(smtpSettings));
                    let template = await this.EmailTemplateModel.findOne({ where: { key: options_1.OptionsMessage.EMAIL_TEMPLATE.category_request } });
                    template = JSON.parse(JSON.stringify(template));
                    let email_data = { AdminName: adminuser.name, Username: user.name, CategoryName: createDto.category_name };
                    await common_util_1.default.sendEmail(adminuser.email, email_data, template, smtpSettings);
                }
            }
            return { status: true, message: common_messages_1.CommonMessages.created_data('CategoryRequest'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async updateProfile(req, id, updateData) {
        try {
            let { local } = req.query;
            if (local == options_1.OptionsMessage.LOCAL_TYPE.ARABIC) {
                updateData.ar_category_name = updateData.category_name;
                delete updateData.category_name;
            }
            const data = await this.CategoryReqService.updateData(id, updateData);
            return { status: true, message: common_messages_1.CommonMessages.updated_data('CategoryRequest'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async deleteProfile(id) {
        try {
            await this.CategoryReqService.deleteData(id);
            return { status: true, message: common_messages_1.CommonMessages.deleted_data('CategoryRequest') };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getAllList(req) {
        try {
            const data = await this.CategoryReqService.getAll();
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
], CategoryRequestController.prototype, "getList", null);
__decorate([
    (0, common_1.Get)('get/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CategoryRequestController.prototype, "getbyId", null);
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CategoryRequestController.prototype, "createProfile", null);
__decorate([
    (0, common_1.Put)('update/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], CategoryRequestController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Delete)('delete/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CategoryRequestController.prototype, "deleteProfile", null);
__decorate([
    (0, common_1.Get)('alllist'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CategoryRequestController.prototype, "getAllList", null);
CategoryRequestController = __decorate([
    (0, common_1.Controller)('/provider/categoryrequest'),
    (0, common_1.UseGuards)(provider_guard_1.ProviderGuard),
    __param(1, (0, typeorm_1.InjectRepository)(user_schema_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(setting_schema_1.Setting)),
    __param(3, (0, typeorm_1.InjectRepository)(email_templates_schema_1.EmailTemplate)),
    __metadata("design:paramtypes", [category_request_service_1.CategoryRequestService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CategoryRequestController);
exports.CategoryRequestController = CategoryRequestController;
//# sourceMappingURL=category_request.controller.js.map