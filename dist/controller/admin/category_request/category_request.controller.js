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
const admin_guard_1 = require("../../../authGuard/admin.guard");
const options_1 = require("../../../common/options");
const typeorm_1 = require("@nestjs/typeorm");
const category_request_schema_1 = require("../../../schema/category_request.schema");
const typeorm_2 = require("typeorm");
const category_schema_1 = require("../../../schema/category.schema");
const xlsx = require("xlsx");
const notification_schema_1 = require("../../../schema/notification.schema");
const user_schema_1 = require("../../../schema/user.schema");
const admin = require("firebase-admin");
const dotenv = require("dotenv");
dotenv.config();
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CREDENTIALS || '{}')),
    });
}
let CategoryRequestController = class CategoryRequestController {
    constructor(CategoryRequestService, CategoryModel, CategoryRequestModel, NotificationModel, User) {
        this.CategoryRequestService = CategoryRequestService;
        this.CategoryModel = CategoryModel;
        this.CategoryRequestModel = CategoryRequestModel;
        this.NotificationModel = NotificationModel;
        this.User = User;
    }
    async getList(req) {
        try {
            const { page, size, s, status } = req.query;
            const data = await this.CategoryRequestService.getAllPages(page, size, s, status);
            return { status: true, message: common_messages_1.CommonMessages.GET_LIST('Category Request'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getuserList(req, id) {
        try {
            const { page, size, s, status } = req.query;
            const data = await this.CategoryRequestService.getUserAllPages(id, page, size, s, status);
            return { status: true, message: common_messages_1.CommonMessages.GET_LIST('Category Request'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getbyId(id) {
        try {
            const data = await this.CategoryRequestService.getData(id);
            return { status: true, message: common_messages_1.CommonMessages.GET_DATA('Category Request'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async createdata(createDto, req) {
        try {
            const data = await this.CategoryRequestService.createData(createDto);
            return { status: true, message: common_messages_1.CommonMessages.created_data('Category Request'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async updatedata(id, updateData, req) {
        try {
            const data = await this.CategoryRequestService.updateData(id, updateData);
            const responsedata = await this.CategoryRequestService.getDatabyid(id);
            if (!responsedata) {
                return { status: false, message: common_messages_1.CommonMessages.notFound('Category request') };
            }
            if (updateData.status == options_1.OptionsMessage.CATEGORY_STATUS.Approved) {
                let newCategoryData = {
                    provider_type: responsedata.provider_type,
                    category_name: responsedata.category_name,
                    category_img: responsedata.category_img,
                    ar_category_name: responsedata.ar_category_name,
                    parent_category_id: responsedata.parent_category_id,
                    is_active: true,
                    category_req_id: id,
                };
                let newCategory = await this.CategoryModel.create(newCategoryData);
                newCategory = await this.CategoryModel.save(newCategory);
                const notificationTitle = 'Category Approved';
                const notificationDescription = `Your category request "${responsedata.category_name}" has been approved.`;
                const notificationData = await this.NotificationModel.save({
                    title: notificationTitle,
                    description: notificationDescription,
                    user_id: responsedata.user_id,
                    click_event: 'category',
                    createdAt: new Date(),
                });
                const user = await this.User.findOne({ where: { id: responsedata.user_id } });
                if (user === null || user === void 0 ? void 0 : user.device_token) {
                    const notificationPayload = {
                        notification: {
                            title: notificationTitle,
                            body: notificationDescription,
                        },
                        data: {
                            title: notificationData.title,
                            description: notificationData.description,
                            user_id: notificationData.user_id.toString(),
                            click_event: notificationData.click_event,
                            createdAt: notificationData.createdAt.toISOString(),
                        },
                        token: user.device_token,
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
            return { status: true, message: common_messages_1.CommonMessages.updated_data('Category Request'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async deletedata(id) {
        try {
            await this.CategoryRequestService.deleteData(id);
            return { status: true, message: common_messages_1.CommonMessages.deleted_data('Category Request') };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async bulkDeletedata(ids) {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                return { status: false, message: `Please select categories for delete`, };
            }
            const deletedCount = await this.CategoryRequestService.bulkDeletedata(ids);
            return { status: true, message: `${deletedCount} categories deleted successfully`, };
        }
        catch (error) {
            return { status: false, message: error.message, };
        }
    }
    async exportListToXLSX(req, res) {
        try {
            const { search, status } = req.query;
            const queryBuilder = this.CategoryRequestModel.createQueryBuilder('category');
            queryBuilder
                .leftJoinAndSelect('category.user', 'user')
                .leftJoinAndSelect('category.parent_category', 'parent_category');
            if (status) {
                queryBuilder.andWhere('category.status = :status', { status });
            }
            if (search) {
                queryBuilder.andWhere(new typeorm_2.Brackets((qb) => {
                    qb.where('user.name LIKE :search', { search: `%${search}%` })
                        .orWhere('category.category_name LIKE :search', { search: `%${search}%` })
                        .orWhere('category.ar_category_name LIKE :search', { search: `%${search}%` });
                }));
            }
            queryBuilder.orderBy('category.createdAt', 'DESC');
            const data = await queryBuilder.getMany();
            const exportedData = data.map((item) => {
                var _a, _b, _c;
                return ({
                    "ID": item.id || '',
                    "User Name": ((_a = item.user) === null || _a === void 0 ? void 0 : _a.name) || '',
                    "Category Name": item.category_name || '',
                    "Arabic Category Name": item.ar_category_name || '',
                    "Provider Type": item.provider_type || '',
                    "Category Image": item.category_img || '',
                    "Parent Category Name": ((_b = item.parent_category) === null || _b === void 0 ? void 0 : _b.category_name) || '',
                    "Parent Arabic Category Name": ((_c = item.parent_category) === null || _c === void 0 ? void 0 : _c.ar_category_name) || '',
                    "Status": item.status || '',
                    "Created At": new Date(item.createdAt).toLocaleString(),
                });
            });
            const ws = xlsx.utils.json_to_sheet(exportedData);
            const wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, ws, 'Category List');
            const buffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=category_list_export.xlsx');
            res.setHeader('Content-Length', buffer.length.toString());
            return res.send(buffer);
        }
        catch (error) {
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
], CategoryRequestController.prototype, "getList", null);
__decorate([
    (0, common_1.Get)('userlist/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], CategoryRequestController.prototype, "getuserList", null);
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
], CategoryRequestController.prototype, "createdata", null);
__decorate([
    (0, common_1.Put)('update/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], CategoryRequestController.prototype, "updatedata", null);
__decorate([
    (0, common_1.Delete)('delete/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CategoryRequestController.prototype, "deletedata", null);
__decorate([
    (0, common_1.Delete)('bulkdelete'),
    __param(0, (0, common_1.Body)('ids')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], CategoryRequestController.prototype, "bulkDeletedata", null);
__decorate([
    (0, common_1.Patch)('export'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CategoryRequestController.prototype, "exportListToXLSX", null);
CategoryRequestController = __decorate([
    (0, common_1.Controller)('/categoryrequest'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(1, (0, typeorm_1.InjectRepository)(category_schema_1.Category)),
    __param(2, (0, typeorm_1.InjectRepository)(category_request_schema_1.CategoryRequest)),
    __param(3, (0, typeorm_1.InjectRepository)(notification_schema_1.Notification)),
    __param(4, (0, typeorm_1.InjectRepository)(user_schema_1.User)),
    __metadata("design:paramtypes", [category_request_service_1.CategoryRequestService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CategoryRequestController);
exports.CategoryRequestController = CategoryRequestController;
//# sourceMappingURL=category_request.controller.js.map