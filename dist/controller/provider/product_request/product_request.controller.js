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
exports.ProductRequestController = void 0;
const common_1 = require("@nestjs/common");
const product_request_service_1 = require("./product_request.service");
const common_messages_1 = require("../../../common/common-messages");
const provider_guard_1 = require("../../../authGuard/provider.guard");
const options_1 = require("../../../common/options");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_schema_1 = require("../../../schema/user.schema");
const setting_schema_1 = require("../../../schema/setting.schema");
const email_templates_schema_1 = require("../../../schema/email_templates.schema");
const common_util_1 = require("../../../common/common.util");
const product_schema_1 = require("../../../schema/product.schema");
const product_request_schema_1 = require("../../../schema/product_request.schema");
let ProductRequestController = class ProductRequestController {
    constructor(ProductRequestService, UserModel, SettingModel, ProductRequestModel, ProductModel, EmailTemplateModel) {
        this.ProductRequestService = ProductRequestService;
        this.UserModel = UserModel;
        this.SettingModel = SettingModel;
        this.ProductRequestModel = ProductRequestModel;
        this.ProductModel = ProductModel;
        this.EmailTemplateModel = EmailTemplateModel;
    }
    async getList(req) {
        try {
            let user_id = req.user.id;
            const { page, size, s, status, cattype } = req.query;
            const data = await this.ProductRequestService.getAllPages(user_id, page, size, s, status, cattype);
            return { status: true, message: common_messages_1.CommonMessages.GET_LIST('Product Request'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getbyId(id) {
        try {
            const data = await this.ProductRequestService.getData(id);
            return { status: true, message: common_messages_1.CommonMessages.GET_DATA('Product Request'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async createdata(createDto, req) {
        try {
            let user_id = req.user.id;
            createDto.user_id = user_id;
            let existingRequest = await this.ProductRequestModel.findOne({ where: { user_id: user_id, product_id: createDto.product_id } });
            let productRequestData = {
                user_id: user_id,
                product_id: createDto.product_id,
                product_price: createDto.product_price,
                delievery_charge: createDto.delievery_charge,
                status: options_1.OptionsMessage.PRODUCT_STATUS.Approved
            };
            let data;
            if (existingRequest) {
                return { status: false, message: 'Product already exist' };
            }
            else {
                data = await this.ProductRequestService.createData(productRequestData);
            }
            if (data) {
                const product = await this.ProductModel.findOne({ where: { id: createDto.product_id } });
                const adminuser = await this.UserModel.findOne({ where: { user_role: options_1.OptionsMessage.USER_ROLE.ADMIN } });
                const user = await this.UserModel.findOne({ where: { id: user_id } });
                if (adminuser) {
                    let smtpSettings = await this.SettingModel.find();
                    smtpSettings = JSON.parse(JSON.stringify(smtpSettings));
                    let template = await this.EmailTemplateModel.findOne({ where: { key: options_1.OptionsMessage.EMAIL_TEMPLATE.category_request } });
                    template = JSON.parse(JSON.stringify(template));
                    let email_data = { AdminName: adminuser.name, Username: user.name, ProductName: product.product_name, ProductDescription: product.description_name };
                    await common_util_1.default.sendEmail(adminuser.email, email_data, template, smtpSettings);
                }
            }
            return { status: true, message: common_messages_1.CommonMessages.created_data('Product Request'), data };
        }
        catch (error) {
            console.log(error);
            return { status: false, message: error.message };
        }
    }
    async createProfile(createDto, req) {
        try {
            let { local } = req.query;
            if (local == options_1.OptionsMessage.LOCAL_TYPE.ARABIC) {
                createDto.ar_product_name = createDto.product_name;
                createDto.ar_description_name = createDto.description_name;
                delete createDto.product_name;
                delete createDto.description_name;
            }
            let user_id = req.user.id;
            createDto.user_id = user_id;
            let dataobj = {
                product_unit: createDto.product_unit,
                provider_type: createDto.provider_type,
                additional_info: createDto.additional_info,
                product_img: createDto.product_img,
                description_name: createDto.description_name,
                product_name: createDto.product_name,
                category_id: createDto.category_id,
                product_price: createDto.product_price,
                delievery_charge: createDto.delievery_charge,
                delievery_address: createDto.delievery_address,
                is_active: false,
            };
            if (local == options_1.OptionsMessage.LOCAL_TYPE.ARABIC) {
                dataobj.ar_product_name = dataobj.product_name;
                dataobj.ar_description_name = dataobj.description_name;
                delete dataobj.product_name;
                delete dataobj.description_name;
            }
            let newCategory = await this.ProductModel.create(dataobj);
            newCategory = await this.ProductModel.save(newCategory);
            let productreqedata = {
                user_id: user_id,
                product_id: newCategory.id,
                product_price: createDto.product_price,
                delievery_charge: createDto.delievery_charge,
                status: options_1.OptionsMessage.PRODUCT_STATUS.Requested
            };
            const data = await this.ProductRequestService.createData(productreqedata);
            if (data) {
                const adminuser = await this.UserModel.findOne({ where: { user_role: options_1.OptionsMessage.USER_ROLE.ADMIN } });
                const user = await this.UserModel.findOne({ where: { id: user_id } });
                if (adminuser) {
                    let smtpSettings = await this.SettingModel.find();
                    smtpSettings = JSON.parse(JSON.stringify(smtpSettings));
                    let template = await this.EmailTemplateModel.findOne({ where: { key: options_1.OptionsMessage.EMAIL_TEMPLATE.category_request } });
                    template = JSON.parse(JSON.stringify(template));
                    let email_data = { AdminName: adminuser.name, Username: user.name, ProductName: createDto.product_name, ProductDescription: createDto.description_name, };
                    await common_util_1.default.sendEmail(adminuser.email, email_data, template, smtpSettings);
                }
            }
            return { status: true, message: common_messages_1.CommonMessages.created_data('Product Request'), data };
        }
        catch (error) {
            console.log(error);
            return { status: false, message: error.message };
        }
    }
    async updateProfile(id, updateData, req) {
        try {
            let { local } = req.query;
            if (local == options_1.OptionsMessage.LOCAL_TYPE.ARABIC) {
                updateData.ar_product_name = updateData.product_name;
                updateData.ar_description_name = updateData.description_name;
                delete updateData.product_name;
                delete updateData.description_name;
            }
            const response_data = await this.ProductRequestService.getDatabyid(id);
            if (!response_data) {
                return { status: false, message: common_messages_1.CommonMessages.notFound('Product Request') };
            }
            const product_data = await this.ProductModel.findOne({ where: { id: response_data === null || response_data === void 0 ? void 0 : response_data.product_id } });
            if (!product_data) {
                return { status: false, message: common_messages_1.CommonMessages.notFound('Product') };
            }
            let product_obj = {
                product_price: updateData.product_price,
                delievery_charge: updateData.delievery_charge,
                status: options_1.OptionsMessage.PRODUCT_STATUS.Approved,
            };
            await this.ProductRequestService.updateData(id, product_obj);
            delete updateData.delievery_charge;
            delete updateData.product_price;
            delete updateData.status;
            let data = await this.ProductModel.update(response_data === null || response_data === void 0 ? void 0 : response_data.product_id, updateData);
            return { status: true, message: common_messages_1.CommonMessages.updated_data('Product Request'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async deleteProfile(id) {
        try {
            await this.ProductRequestService.deleteData(id);
            return { status: true, message: common_messages_1.CommonMessages.deleted_data('Product Request') };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getAllList(req) {
        try {
            const data = await this.ProductRequestService.getAll();
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
], ProductRequestController.prototype, "getList", null);
__decorate([
    (0, common_1.Get)('get/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductRequestController.prototype, "getbyId", null);
__decorate([
    (0, common_1.Post)('createexist'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductRequestController.prototype, "createdata", null);
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductRequestController.prototype, "createProfile", null);
__decorate([
    (0, common_1.Put)('update/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], ProductRequestController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Delete)('delete/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductRequestController.prototype, "deleteProfile", null);
__decorate([
    (0, common_1.Get)('alllist'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductRequestController.prototype, "getAllList", null);
ProductRequestController = __decorate([
    (0, common_1.Controller)('/provider/productrequest'),
    (0, common_1.UseGuards)(provider_guard_1.ProviderGuard),
    __param(1, (0, typeorm_1.InjectRepository)(user_schema_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(setting_schema_1.Setting)),
    __param(3, (0, typeorm_1.InjectRepository)(product_request_schema_1.ProductRequest)),
    __param(4, (0, typeorm_1.InjectRepository)(product_schema_1.Product)),
    __param(5, (0, typeorm_1.InjectRepository)(email_templates_schema_1.EmailTemplate)),
    __metadata("design:paramtypes", [product_request_service_1.ProductRequestService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ProductRequestController);
exports.ProductRequestController = ProductRequestController;
//# sourceMappingURL=product_request.controller.js.map