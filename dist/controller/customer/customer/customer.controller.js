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
exports.CustomerController = void 0;
const common_1 = require("@nestjs/common");
const customer_service_1 = require("./customer.service");
const common_messages_1 = require("../../../common/common-messages");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const user_guard_1 = require("../../../authGuard/user.guard");
const typeorm_1 = require("@nestjs/typeorm");
const product_schema_1 = require("../../../schema/product.schema");
const typeorm_2 = require("typeorm");
const category_schema_1 = require("../../../schema/category.schema");
const product_request_schema_1 = require("../../../schema/product_request.schema");
const options_1 = require("../../../common/options");
const notification_schema_1 = require("../../../schema/notification.schema");
let CustomerController = class CustomerController {
    constructor(customerService, ProductModel, CategoryModel, ProductRequestModel, NotificationService) {
        this.customerService = customerService;
        this.ProductModel = ProductModel;
        this.CategoryModel = CategoryModel;
        this.ProductRequestModel = ProductRequestModel;
        this.NotificationService = NotificationService;
    }
    async CustomerDocument(CustomerDocument, id) {
        try {
            const data = await this.customerService.GetCustomerDocument(id);
            return { status: true, message: common_messages_1.CommonMessages.upload_data('Document'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async uploaddocument(CustomerDocument) {
        try {
            const data = await this.customerService.createCustomerDocument(CustomerDocument);
            return { status: true, message: common_messages_1.CommonMessages.upload_data('Document'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async UpdateCustomerDocument(CustomerDocument, id) {
        try {
            const data = await this.customerService.UpdateCustomerDocument(id, CustomerDocument);
            return { status: true, message: common_messages_1.CommonMessages.upload_data('Document'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getCustomerProfile(req) {
        try {
            const customer_id = req.user.id;
            const data = await this.customerService.getCustomerData(customer_id);
            return { status: true, message: common_messages_1.CommonMessages.GET_DATA('Profile'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async updateCustomerProfile(id, updateData) {
        try {
            const data = await this.customerService.updateCustomerData(id, updateData);
            return { status: true, message: common_messages_1.CommonMessages.updated_data('Profile'), data };
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
    async GlobelSearch(req) {
        try {
            let { s } = req.query;
            let product_query = `(product.product_name LIKE :search COLLATE utf8mb4_general_ci 
                OR product.ar_product_name LIKE :search COLLATE utf8mb4_general_ci)`;
            let product_data = await this.ProductModel.createQueryBuilder('product')
                .where(product_query, { search: `%${s}%` })
                .getMany();
            product_data = JSON.parse(JSON.stringify(product_data));
            let category_query = `(category.category_name LIKE :search COLLATE utf8mb4_general_ci 
                OR category.ar_category_name LIKE :search COLLATE utf8mb4_general_ci)`;
            let category_data = await this.CategoryModel.createQueryBuilder('category')
                .where(category_query, { search: `%${s}%` })
                .getMany();
            let product_req_data = await this.ProductRequestModel.find({
                where: { status: options_1.OptionsMessage.PRODUCT_STATUS.Approved },
            });
            product_req_data = JSON.parse(JSON.stringify(product_req_data));
            for (let element of product_data) {
                let provider_data = product_req_data.filter((o) => o.product_id == element.id);
                element.provider_available = provider_data.length || 0;
            }
            let random_category = await this.CategoryModel.createQueryBuilder()
                .orderBy('RAND()')
                .limit(5)
                .getMany();
            return {
                status: true,
                message: common_messages_1.CommonMessages.upload_data('Document'),
                data: { product_data, category_data, random_category },
            };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getAllNotificationPages(req) {
        try {
            const customer_id = req.user.id;
            const { page, size, s } = req.query;
            const data = await this.customerService.getAllNotificationPages(customer_id, page, size, s);
            return { status: true, message: common_messages_1.CommonMessages.GET_LIST('notification'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
};
__decorate([
    (0, common_1.Get)('getcustomerdocument/:id'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "CustomerDocument", null);
__decorate([
    (0, common_1.Post)('uploaddocument'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "uploaddocument", null);
__decorate([
    (0, common_1.Put)('updatecustomerdocument/:id'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "UpdateCustomerDocument", null);
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "getCustomerProfile", null);
__decorate([
    (0, common_1.Put)('/profile/update/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "updateCustomerProfile", null);
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
], CustomerController.prototype, "uploadFiles", null);
__decorate([
    (0, common_1.Get)('globelsearch'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "GlobelSearch", null);
__decorate([
    (0, common_1.Get)('notification-list'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "getAllNotificationPages", null);
CustomerController = __decorate([
    (0, common_1.Controller)('/customer'),
    (0, common_1.UseGuards)(user_guard_1.UserGuard),
    __param(1, (0, typeorm_1.InjectRepository)(product_schema_1.Product)),
    __param(2, (0, typeorm_1.InjectRepository)(category_schema_1.Category)),
    __param(3, (0, typeorm_1.InjectRepository)(product_request_schema_1.ProductRequest)),
    __param(4, (0, typeorm_1.InjectRepository)(notification_schema_1.Notification)),
    __metadata("design:paramtypes", [customer_service_1.CustomerService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CustomerController);
exports.CustomerController = CustomerController;
//# sourceMappingURL=customer.controller.js.map