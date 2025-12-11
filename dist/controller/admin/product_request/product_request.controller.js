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
const admin_guard_1 = require("../../../authGuard/admin.guard");
const options_1 = require("../../../common/options");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_schema_1 = require("../../../schema/product.schema");
const xlsx = require("xlsx");
const product_request_schema_1 = require("../../../schema/product_request.schema");
const admin = require("firebase-admin");
const dotenv = require("dotenv");
const notification_schema_1 = require("../../../schema/notification.schema");
const user_schema_1 = require("../../../schema/user.schema");
dotenv.config();
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CREDENTIALS || '{}')),
    });
}
let ProductRequestController = class ProductRequestController {
    constructor(ProductRequestService, ProductModel, ProductRequestModel, NotificationModel, UserModel) {
        this.ProductRequestService = ProductRequestService;
        this.ProductModel = ProductModel;
        this.ProductRequestModel = ProductRequestModel;
        this.NotificationModel = NotificationModel;
        this.UserModel = UserModel;
    }
    async getList(req) {
        try {
            const { page, size, s, status, category_id } = req.query;
            const data = await this.ProductRequestService.getAllPages(page, size, s, status, category_id);
            return { status: true, message: common_messages_1.CommonMessages.GET_LIST('Product Request'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getUserList(req, id) {
        try {
            const { page, size, s, status } = req.query;
            const data = await this.ProductRequestService.getUserAllPages(id, page, size, s, status);
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
            let dataobj = {
                description_name: createDto.description_name,
                ar_description_name: createDto.ar_description_name,
                product_unit: createDto.product_unit,
                provider_type: createDto.provider_type,
                product_name: createDto.product_name,
                additional_info: createDto.additional_info,
                product_img: createDto.product_img,
                ar_product_name: createDto.ar_product_name,
                category_id: createDto.category_id,
                product_price: createDto.product_price,
                delievery_charge: createDto.delievery_charge,
                delievery_address: createDto.delievery_address,
                is_active: true,
            };
            let newCategory = await this.ProductModel.create(dataobj);
            newCategory = await this.ProductModel.save(newCategory);
            let productreqedata = {
                user_id: createDto.user_id,
                product_id: newCategory.id,
                product_price: createDto.product_price,
                delievery_charge: createDto.delievery_charge,
                status: options_1.OptionsMessage.PRODUCT_STATUS.Approved
            };
            const data = await this.ProductRequestService.createData(productreqedata);
            return { status: true, message: common_messages_1.CommonMessages.created_data('Product Request'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async updatedata(id, updateData, req) {
        try {
            let product_obj = (updateData.status == options_1.OptionsMessage.PRODUCT_STATUS.Approved) ?
                { status: options_1.OptionsMessage.PRODUCT_STATUS.Approved } : (updateData.status == options_1.OptionsMessage.PRODUCT_STATUS.Rejected) ? { status: options_1.OptionsMessage.PRODUCT_STATUS.Rejected } : {
                product_price: updateData.product_price,
                delievery_charge: updateData.delievery_charge,
                status: options_1.OptionsMessage.PRODUCT_STATUS.Requested,
            };
            const data = await this.ProductRequestService.updateData(id, product_obj);
            const response_data = await this.ProductRequestService.getDatabyid(id);
            if (!response_data) {
                return { status: false, message: common_messages_1.CommonMessages.notFound('Product Request') };
            }
            const product_data = await this.ProductModel.findOne({ where: { id: response_data === null || response_data === void 0 ? void 0 : response_data.product_id } });
            if (!product_data) {
                return { status: false, message: common_messages_1.CommonMessages.notFound('Product') };
            }
            if (response_data && updateData.status == options_1.OptionsMessage.PRODUCT_STATUS.Approved) {
                let obj = { is_active: true };
                await this.ProductModel.update(response_data.product_id, obj);
            }
            const prod = await this.ProductRequestModel.findOne({ where: { id } });
            const RealUser = await this.UserModel.findOne({ where: { id: prod.user_id } });
            console.log(RealUser.device_token);
            if (updateData.status == options_1.OptionsMessage.PRODUCT_STATUS.Approved) {
                console.log('RealUser.device_token');
                const notificationTitle = "Product Request Approved";
                const notificationDescription = `Your product request for "${product_data.product_name}" has been approved.`;
                const dataPayload = await this.NotificationModel.save({
                    title: notificationTitle,
                    description: notificationDescription,
                    user_id: RealUser.id,
                    click_event: 'product_request',
                    createdAt: new Date(),
                });
                const deviceToken = RealUser.device_token;
                if (deviceToken) {
                    const notificationPayload = {
                        notification: {
                            title: notificationTitle,
                            body: notificationDescription,
                        },
                        data: {
                            title: dataPayload.title,
                            description: dataPayload.description,
                            user_id: dataPayload.user_id.toString(),
                            click_event: dataPayload.click_event,
                            createdAt: dataPayload.createdAt.toISOString(),
                        },
                        token: deviceToken,
                    };
                    try {
                        const response = await admin.messaging().send(notificationPayload);
                        console.log(`Notification sent successfully: ${response}`);
                    }
                    catch (error) {
                        console.log('Error sending notification:', error.message || error);
                    }
                }
                else {
                    console.log('No device token found for the user.');
                }
                await this.ProductModel.update(response_data.product_id, { is_active: true });
            }
            else if (updateData.status == options_1.OptionsMessage.PRODUCT_STATUS.Rejected) {
                const notificationTitle = "Product Request Rejected";
                const notificationDescription = `Your product request for "${product_data.product_name}" has been rejected.`;
                const dataPayload = await this.NotificationModel.save({
                    title: notificationTitle,
                    description: notificationDescription,
                    user_id: RealUser.id,
                    click_event: 'product_request',
                    createdAt: new Date(),
                });
                const deviceToken = RealUser.device_token;
                console.log(deviceToken, "deviceToken");
                if (deviceToken) {
                    const notificationPayload = {
                        notification: {
                            title: notificationTitle,
                            body: notificationDescription,
                        },
                        data: {
                            title: dataPayload.title,
                            description: dataPayload.description,
                            user_id: dataPayload.user_id.toString(),
                            click_event: dataPayload.click_event,
                            createdAt: dataPayload.createdAt.toISOString(),
                        },
                        token: deviceToken,
                    };
                    try {
                        const response = await admin.messaging().send(notificationPayload);
                        console.log(`Notification sent successfully: ${response}`);
                    }
                    catch (error) {
                        console.error('Error sending notification:', error.message || error);
                    }
                }
                else {
                    console.log('No device token found for the user.');
                }
            }
            delete updateData.status;
            delete updateData.delievery_charge;
            delete updateData.product_price;
            let Productdata = await this.ProductModel.update(response_data === null || response_data === void 0 ? void 0 : response_data.product_id, updateData);
            return { status: true, message: common_messages_1.CommonMessages.updated_data('Product Request'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async updateActive(id, updateData, req) {
        try {
            const data = await this.ProductRequestService.updateData(id, updateData);
            return { status: true, message: common_messages_1.CommonMessages.updated_data('Product Request'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async deletedata(id) {
        try {
            await this.ProductRequestService.deleteData(id);
            return { status: true, message: common_messages_1.CommonMessages.deleted_data('Product Request') };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async bulkDeletedata(ids) {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                return { status: false, message: `Please select Product for delete`, };
            }
            const deletedCount = await this.ProductRequestService.bulkDeletedata(ids);
            return { status: true, message: `${deletedCount} Product deleted successfully`, };
        }
        catch (error) {
            return { status: false, message: error.message, };
        }
    }
    async exportAllPagesToXLSX(req, res) {
        try {
            const { search = '', status, category_id } = req.query;
            const queryBuilder = this.ProductRequestModel.createQueryBuilder('productRequest')
                .leftJoinAndSelect('productRequest.user', 'user')
                .leftJoinAndSelect('productRequest.product', 'product')
                .leftJoinAndSelect('product.category', 'category')
                .select([
                'productRequest',
                'user.name',
                'user.address_one',
                'user.address_two',
                'product.provider_type',
                'product.product_img',
                'product.product_name',
                'product.description_name',
                'product.ar_product_name',
                'product.ar_description_name',
                'product.delievery_charge',
                'product.product_price',
                'product.product_unit',
                'product.createdAt',
                'product.category_id',
                'category.category_name',
                'category.ar_category_name',
            ])
                .orderBy('productRequest.createdAt', 'DESC');
            if (status) {
                queryBuilder.andWhere('productRequest.status = :status', { status });
            }
            if (category_id) {
                queryBuilder.andWhere('product.category_id = :category_id', { category_id });
            }
            if (search) {
                queryBuilder.andWhere('(product.product_name LIKE :search COLLATE utf8mb4_general_ci OR product.ar_product_name LIKE :search COLLATE utf8mb4_general_ci)', { search: `%${search}%` });
            }
            const pages = await queryBuilder.getMany();
            const exportedData = pages.map((productRequest) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
                return ({
                    "Request ID": productRequest.id || '',
                    "User Name": ((_a = productRequest.user) === null || _a === void 0 ? void 0 : _a.name) || '',
                    "User Address One": ((_b = productRequest.user) === null || _b === void 0 ? void 0 : _b.address_one) || '',
                    "User Address Two": ((_c = productRequest.user) === null || _c === void 0 ? void 0 : _c.address_two) || '',
                    "Provider Type": ((_d = productRequest.product) === null || _d === void 0 ? void 0 : _d.provider_type) || '',
                    "Product Name": ((_e = productRequest.product) === null || _e === void 0 ? void 0 : _e.product_name) || '',
                    "Arabic Product Name": ((_f = productRequest.product) === null || _f === void 0 ? void 0 : _f.ar_product_name) || '',
                    "Description": ((_g = productRequest.product) === null || _g === void 0 ? void 0 : _g.description_name) || '',
                    "Arabic Description": ((_h = productRequest.product) === null || _h === void 0 ? void 0 : _h.ar_description_name) || '',
                    "Delivery Charge": ((_j = productRequest.product) === null || _j === void 0 ? void 0 : _j.delievery_charge) || '',
                    "Price": ((_k = productRequest.product) === null || _k === void 0 ? void 0 : _k.product_price) || '',
                    "Unit": ((_l = productRequest.product) === null || _l === void 0 ? void 0 : _l.product_unit) || '',
                    "Category": ((_o = (_m = productRequest.product) === null || _m === void 0 ? void 0 : _m.category) === null || _o === void 0 ? void 0 : _o.category_name) || '',
                    "Arabic Category": ((_q = (_p = productRequest.product) === null || _p === void 0 ? void 0 : _p.category) === null || _q === void 0 ? void 0 : _q.ar_category_name) || '',
                    "Created At": new Date((_r = productRequest.product) === null || _r === void 0 ? void 0 : _r.createdAt).toLocaleString(),
                    "Status": productRequest.status || '',
                });
            });
            const ws = xlsx.utils.json_to_sheet(exportedData);
            const wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, ws, 'Product Requests');
            const buffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=product_requests_export.xlsx');
            res.setHeader('Content-Length', buffer.length.toString());
            return res.send(buffer);
        }
        catch (error) {
            console.error('Error exporting product requests:', error);
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
], ProductRequestController.prototype, "getList", null);
__decorate([
    (0, common_1.Get)('userlist/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ProductRequestController.prototype, "getUserList", null);
__decorate([
    (0, common_1.Get)('get/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductRequestController.prototype, "getbyId", null);
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductRequestController.prototype, "createdata", null);
__decorate([
    (0, common_1.Put)('update/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], ProductRequestController.prototype, "updatedata", null);
__decorate([
    (0, common_1.Put)('active/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], ProductRequestController.prototype, "updateActive", null);
__decorate([
    (0, common_1.Delete)('delete/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductRequestController.prototype, "deletedata", null);
__decorate([
    (0, common_1.Delete)('bulkdelete'),
    __param(0, (0, common_1.Body)('ids')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], ProductRequestController.prototype, "bulkDeletedata", null);
__decorate([
    (0, common_1.Patch)('export'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductRequestController.prototype, "exportAllPagesToXLSX", null);
ProductRequestController = __decorate([
    (0, common_1.Controller)('/productrequest'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(1, (0, typeorm_1.InjectRepository)(product_schema_1.Product)),
    __param(2, (0, typeorm_1.InjectRepository)(product_request_schema_1.ProductRequest)),
    __param(3, (0, typeorm_1.InjectRepository)(notification_schema_1.Notification)),
    __param(4, (0, typeorm_1.InjectRepository)(user_schema_1.User)),
    __metadata("design:paramtypes", [product_request_service_1.ProductRequestService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ProductRequestController);
exports.ProductRequestController = ProductRequestController;
//# sourceMappingURL=product_request.controller.js.map