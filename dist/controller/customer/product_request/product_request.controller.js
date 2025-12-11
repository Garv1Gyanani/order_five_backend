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
const options_1 = require("../../../common/options");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_schema_1 = require("../../../schema/product.schema");
const xlsx = require("xlsx");
const product_request_schema_1 = require("../../../schema/product_request.schema");
const user_guard_1 = require("../../../authGuard/user.guard");
let ProductRequestController = class ProductRequestController {
    constructor(ProductRequestService, ProductModel, ProductRequestModel) {
        this.ProductRequestService = ProductRequestService;
        this.ProductModel = ProductModel;
        this.ProductRequestModel = ProductRequestModel;
    }
    async getList(req) {
        try {
            const { page, size, s, status, category_id } = req.query;
            const data = await this.ProductRequestService.getAllPages(page, size, s, status, category_id);
            return { status: true, message: common_messages_1.CommonMessages.GET_LIST('ProductRequest'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getbyId(id) {
        try {
            const data = await this.ProductRequestService.getData(id);
            return { status: true, message: common_messages_1.CommonMessages.GET_DATA('ProductRequest'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async createProfile(createDto, req) {
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
                is_active: false,
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
            return { status: true, message: common_messages_1.CommonMessages.created_data('ProductRequest'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async updateProfile2(id, updateData) {
        try {
            let product_obj = {
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
    async deleteProfile(id) {
        try {
            await this.ProductRequestService.deleteData(id);
            return { status: true, message: common_messages_1.CommonMessages.deleted_data('ProductRequest') };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async exportListToXLSX(req, res) {
        try {
            let { s, status } = req.query;
            const whereCondition = {};
            if (status) {
                whereCondition.status = status;
            }
            if (s) {
                whereCondition.user = { name: (0, typeorm_2.Like)(`%${s}%`) };
            }
            const data = await this.ProductRequestModel.find({
                where: whereCondition,
                relations: ['user', 'product'],
                select: {
                    user: { name: true },
                },
                order: { createdAt: 'DESC' },
            });
            const exportedData = data.map((item) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                return ({
                    "ID": (item === null || item === void 0 ? void 0 : item.id) || '',
                    "Provider Type": ((_a = item === null || item === void 0 ? void 0 : item.product) === null || _a === void 0 ? void 0 : _a.provider_type) || '',
                    "Product Name": ((_b = item === null || item === void 0 ? void 0 : item.product) === null || _b === void 0 ? void 0 : _b.product_name) || '',
                    "Additional Info": ((_c = item === null || item === void 0 ? void 0 : item.product) === null || _c === void 0 ? void 0 : _c.additional_info) || '',
                    "Arabic Product Name": ((_d = item === null || item === void 0 ? void 0 : item.product) === null || _d === void 0 ? void 0 : _d.ar_product_name) || '',
                    "Description": ((_e = item === null || item === void 0 ? void 0 : item.product) === null || _e === void 0 ? void 0 : _e.description_name) || '',
                    "Arabic Description": ((_f = item === null || item === void 0 ? void 0 : item.product) === null || _f === void 0 ? void 0 : _f.ar_description_name) || '',
                    "Product Image": ((_g = item === null || item === void 0 ? void 0 : item.product) === null || _g === void 0 ? void 0 : _g.product_img) || '',
                    "Product Unit": ((_h = item === null || item === void 0 ? void 0 : item.product) === null || _h === void 0 ? void 0 : _h.product_unit) || '',
                    "Product Price": ((_j = item === null || item === void 0 ? void 0 : item.product) === null || _j === void 0 ? void 0 : _j.product_price) || '',
                    "Delievery Charge": ((_k = item === null || item === void 0 ? void 0 : item.product) === null || _k === void 0 ? void 0 : _k.delievery_charge) || '',
                    "Is Active": (item === null || item === void 0 ? void 0 : item.is_active) ? 'Active' : 'Inactive',
                    "Created At": new Date(item === null || item === void 0 ? void 0 : item.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }),
                });
            });
            const ws = xlsx.utils.json_to_sheet(exportedData);
            const wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, ws, 'Product List');
            const buffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=product_list_export.xlsx');
            res.setHeader('Content-Length', buffer.length.toString());
            return res.send(buffer);
        }
        catch (error) {
            console.log(error);
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
], ProductRequestController.prototype, "createProfile", null);
__decorate([
    (0, common_1.Put)('update/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ProductRequestController.prototype, "updateProfile2", null);
__decorate([
    (0, common_1.Delete)('delete/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductRequestController.prototype, "deleteProfile", null);
__decorate([
    (0, common_1.Patch)('export'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductRequestController.prototype, "exportListToXLSX", null);
ProductRequestController = __decorate([
    (0, common_1.Controller)('/customer/productrequest'),
    (0, common_1.UseGuards)(user_guard_1.UserGuard),
    __param(1, (0, typeorm_1.InjectRepository)(product_schema_1.Product)),
    __param(2, (0, typeorm_1.InjectRepository)(product_request_schema_1.ProductRequest)),
    __metadata("design:paramtypes", [product_request_service_1.ProductRequestService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ProductRequestController);
exports.ProductRequestController = ProductRequestController;
//# sourceMappingURL=product_request.controller.js.map