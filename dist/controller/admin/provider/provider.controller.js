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
exports.ProviderController = void 0;
const common_1 = require("@nestjs/common");
const provider_service_1 = require("./provider.service");
const common_messages_1 = require("../../../common/common-messages");
const admin_guard_1 = require("../../../authGuard/admin.guard");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const typeorm_1 = require("@nestjs/typeorm");
const user_document_schema_1 = require("../../../schema/user_document.schema");
const typeorm_2 = require("typeorm");
const xlsx = require("xlsx");
const options_1 = require("../../../common/options");
const user_schema_1 = require("../../../schema/user.schema");
const email_templates_schema_1 = require("../../../schema/email_templates.schema");
const required_doc_schema_1 = require("../../../schema/required_doc.schema");
const admin = require("firebase-admin");
const dotenv = require("dotenv");
const notification_schema_1 = require("../../../schema/notification.schema");
const rating_schema_1 = require("../../../schema/rating.schema");
const order_schema_1 = require("../../../schema/order.schema");
const wallet_req_schema_1 = require("../../../schema/wallet_req.schema");
const subscription_schema_1 = require("../../../schema/subscription.schema");
dotenv.config();
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CREDENTIALS || '{}')),
    });
}
let ProviderController = class ProviderController {
    constructor(ProviderService, UserModel, Required_docModel, EmailTemplateModel, UserDocumentModel, NotificationModel, Order, RatingModel, wallet_req, SubscriptionModel) {
        this.ProviderService = ProviderService;
        this.UserModel = UserModel;
        this.Required_docModel = Required_docModel;
        this.EmailTemplateModel = EmailTemplateModel;
        this.UserDocumentModel = UserDocumentModel;
        this.NotificationModel = NotificationModel;
        this.Order = Order;
        this.RatingModel = RatingModel;
        this.wallet_req = wallet_req;
        this.SubscriptionModel = SubscriptionModel;
    }
    async getUserList(req) {
        try {
            const { page, size, s } = req.query;
            const data = await this.ProviderService.getAllPages(page, size, s);
            return { status: true, message: common_messages_1.CommonMessages.GET_LIST('Provider'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getAllprovider(req) {
        try {
            const userRoles = [options_1.OptionsMessage.USER_ROLE.PROVIDER];
            const providers = await this.UserModel.find({ where: { user_role: (0, typeorm_2.In)(userRoles) }, select: ['id', 'name', 'phone_num'], });
            const formattedData = providers.map(provider => ({
                id: provider.id,
                name: `${provider.name} ( ${provider.phone_num} )`
            }));
            return { status: true, message: common_messages_1.CommonMessages.GET_LIST('Provider'), data: formattedData };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getAllUsers(req) {
        try {
            const userRoles = [options_1.OptionsMessage.USER_ROLE.CUSTOMER, options_1.OptionsMessage.USER_ROLE.PROVIDER];
            const data = await this.UserModel.find({ where: { user_role: (0, typeorm_2.In)(userRoles) }, select: ['id', 'name', 'phone_num'], });
            const formattedData = data.map(items => ({
                id: items.id,
                name: `${items.name} ( ${items.phone_num} )`
            }));
            return { status: true, message: common_messages_1.CommonMessages.GET_LIST('Users'), data: formattedData };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getUserbyId(id) {
        try {
            let data = await this.ProviderService.getUserData(id);
            let requiredDocs = await this.Required_docModel.find({ where: { is_active: true }, select: ['id'], });
            let requiredDocIds = requiredDocs.map(doc => doc.id);
            let userApprovedDocs = await this.UserDocumentModel.count({ where: { user_id: id, required_doc_id: (0, typeorm_2.In)(requiredDocIds) } });
            let orderCount = await this.Order.count({
                where: {
                    provider_id: id,
                    status: (0, typeorm_2.Not)((0, typeorm_2.In)(['CANCELBYCUSTOMER', 'CANCELBYPROVIDER', 'CANCELBYADMIN']))
                }
            });
            let ReviewRating = await this.RatingModel.count({
                where: {
                    provider_id: id,
                }
            });
            let walletRequests = await this.wallet_req.find({
                where: {
                    user_id: id,
                    amount_status: 'Debit',
                    status: 'Approved'
                },
                select: ['amount']
            });
            const ratings = await this.RatingModel.find({
                where: { provider_id: id },
                select: ['rating']
            });
            const totalRatings = ratings.length;
            const totalRatingSum = ratings.reduce((sum, item) => sum + Number(item.rating), 0);
            const averageRating = totalRatings > 0 ? totalRatingSum / totalRatings : 0;
            const roundedRating = Math.round(averageRating * 2) / 2;
            let walletAmount = walletRequests.reduce((sum, req) => sum + Number(req.amount), 0);
            let count = requiredDocIds.length + 6;
            let totalcount = userApprovedDocs;
            if (data === null || data === void 0 ? void 0 : data.name) {
                totalcount += 1;
            }
            if (data === null || data === void 0 ? void 0 : data.phone_num) {
                totalcount += 1;
            }
            if (data === null || data === void 0 ? void 0 : data.id_number) {
                totalcount += 1;
            }
            if (data === null || data === void 0 ? void 0 : data.vehical_name) {
                totalcount += 1;
            }
            if (data === null || data === void 0 ? void 0 : data.vehical_plat_num) {
                totalcount += 1;
            }
            if (data === null || data === void 0 ? void 0 : data.image_url) {
                totalcount += 1;
            }
            let profileCompletePercentage = 0;
            if (count > 0) {
                profileCompletePercentage = (totalcount / count) * 100;
            }
            data.profile_complete_per = parseFloat(profileCompletePercentage.toFixed(2));
            data.orderCount = orderCount;
            data.ReviewRating = ReviewRating;
            data.walletAmount = walletAmount;
            data.rating = roundedRating;
            return { status: true, message: common_messages_1.CommonMessages.GET_DATA('Provider'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async createUserdata(createUserDto) {
        try {
            createUserDto.status = options_1.OptionsMessage.PROVIDER_STATUS.Approved;
            const data = await this.ProviderService.createUserData(createUserDto);
            let user_id = data.id;
            if ((createUserDto === null || createUserDto === void 0 ? void 0 : createUserDto.user_document) && createUserDto.user_document.length) {
                for (const element of createUserDto.user_document) {
                    let existingDoc = await this.UserDocumentModel.findOne({ where: { user_id: user_id, required_doc_id: element === null || element === void 0 ? void 0 : element.required_doc_id }, });
                    if (existingDoc) {
                        existingDoc.document = element.document || existingDoc.document;
                        existingDoc.status = options_1.OptionsMessage.USER_DOCUMENT.Approved;
                        await this.UserDocumentModel.save(existingDoc);
                    }
                    else {
                        const newDoc = this.UserDocumentModel.create({
                            user_id: user_id,
                            required_doc_id: element === null || element === void 0 ? void 0 : element.required_doc_id,
                            document: element.document,
                            status: options_1.OptionsMessage.USER_DOCUMENT.Approved
                        });
                        await this.UserDocumentModel.save(newDoc);
                    }
                }
            }
            return { status: true, message: common_messages_1.CommonMessages.created_data('Provider'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async updateUserdata(id, updateData) {
        try {
            const user_document = updateData.user_document;
            delete updateData.user_document;
            const exists_data = await this.ProviderService.getUserData(id);
            if (!exists_data) {
                return { status: false, message: common_messages_1.CommonMessages.notFound('Provider') };
            }
            const data = await this.ProviderService.updateUserData(id, updateData);
            let user_id = id;
            if (user_document && user_document.length) {
                for (const element of user_document) {
                    let existingDoc = await this.UserDocumentModel.findOne({ where: { user_id: user_id, required_doc_id: element === null || element === void 0 ? void 0 : element.required_doc_id }, });
                    if (existingDoc) {
                        existingDoc.document = element.document;
                        existingDoc.status = element.document ? options_1.OptionsMessage.USER_DOCUMENT.Approved : options_1.OptionsMessage.USER_DOCUMENT.Requested;
                        await this.UserDocumentModel.save(existingDoc);
                    }
                    else {
                        const newDoc = this.UserDocumentModel.create({
                            user_id: user_id,
                            required_doc_id: element === null || element === void 0 ? void 0 : element.required_doc_id,
                            document: element.document,
                            status: options_1.OptionsMessage.USER_DOCUMENT.Approved
                        });
                        await this.UserDocumentModel.save(newDoc);
                    }
                }
            }
            return { status: true, message: common_messages_1.CommonMessages.updated_data('Provider'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async deleteUserdata(id) {
        try {
            await this.ProviderService.deleteUserData(id);
            return { status: true, message: common_messages_1.CommonMessages.deleted_data('Provider') };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async bulkDeletedata(ids) {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                return { status: false, message: `Please select Provider for delete`, };
            }
            const deletedCount = await this.ProviderService.bulkDeletedata(ids);
            return { status: true, message: `${deletedCount} Provider deleted successfully`, };
        }
        catch (error) {
            return { status: false, message: error.message, };
        }
    }
    async exportListToXLSX(req, res) {
        try {
            const { s = '' } = req.query;
            let whereConditions = { user_role: options_1.OptionsMessage.USER_ROLE.PROVIDER };
            if (s) {
                whereConditions = [
                    { user_role: options_1.OptionsMessage.USER_ROLE.PROVIDER, phone_num: (0, typeorm_2.Like)(`%${s}%`) },
                    { user_role: options_1.OptionsMessage.USER_ROLE.PROVIDER, email: (0, typeorm_2.Like)(`%${s}%`) },
                    { user_role: options_1.OptionsMessage.USER_ROLE.PROVIDER, name: (0, typeorm_2.Like)(`%${s}%`) },
                ];
            }
            const data = await this.UserModel.find({ where: whereConditions, order: { createdAt: 'DESC' } });
            const providerIds = data.map((provider) => provider.id);
            const ratings = await this.RatingModel.createQueryBuilder('ratings')
                .select('ratings.provider_id', 'providerId')
                .addSelect('AVG(ratings.rating)', 'averageRating')
                .addSelect('COUNT(ratings.rating)', 'ratingCount')
                .where('ratings.provider_id IN (:...providerIds)', { providerIds })
                .groupBy('ratings.provider_id')
                .getRawMany();
            const subscriptionIds = data
                .map((provider) => provider.subscription_id)
                .filter((id) => id !== null);
            let subscriptionsMap = {};
            if (subscriptionIds.length > 0) {
                const subscriptions = await this.SubscriptionModel.find({
                    where: { id: (0, typeorm_2.In)(subscriptionIds) },
                    select: ['id', 'name'],
                });
                subscriptionsMap = subscriptions.reduce((acc, sub) => {
                    acc[sub.id] = sub.name;
                    return acc;
                }, {});
            }
            const roundToHalf = (value) => Math.round(value * 2) / 2;
            const ratingsMap = ratings.reduce((acc, rating) => {
                acc[rating.providerId] = {
                    averageRating: roundToHalf(parseFloat(rating.averageRating)),
                    ratingCount: parseInt(rating.ratingCount, 10),
                };
                return acc;
            }, {});
            const exportedData = data.map((item) => {
                var _a;
                return ({
                    "Name": (item === null || item === void 0 ? void 0 : item.name) || '',
                    "Phone": (item === null || item === void 0 ? void 0 : item.phone_num) || '',
                    "Status": (item === null || item === void 0 ? void 0 : item.status) || '',
                    "Address 1": (item === null || item === void 0 ? void 0 : item.address_one) || '',
                    "Address 2": (item === null || item === void 0 ? void 0 : item.address_two) || '',
                    "Rating": ((_a = ratingsMap[item.id]) === null || _a === void 0 ? void 0 : _a.averageRating) || 0,
                    "Remark": (item === null || item === void 0 ? void 0 : item.remark) || '',
                    "Available Balance": (item === null || item === void 0 ? void 0 : item.wallet_balance) || '',
                    "Is Active": (item === null || item === void 0 ? void 0 : item.is_active) ? 'Active' : 'Inactive',
                    "Plan Type": item.subscription_id ? subscriptionsMap[item.subscription_id] || null : null,
                    "Created At": new Date(item === null || item === void 0 ? void 0 : item.createdAt).toLocaleString(),
                });
            });
            const ws = xlsx.utils.json_to_sheet(exportedData);
            const wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, ws, 'Provider List');
            const buffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=provider_list_export.xlsx');
            res.setHeader('Content-Length', buffer.length.toString());
            return res.send(buffer);
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ status: false, message: error.message });
        }
    }
    async UserDocument(UserDocument, id) {
        try {
            const data = await this.ProviderService.GetUserDocument(id);
            return { status: true, message: common_messages_1.CommonMessages.upload_data('Document'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async uploaddocument(UserDocument) {
        try {
            const data = await this.ProviderService.createUserDocument(UserDocument);
            return { status: true, message: common_messages_1.CommonMessages.upload_data('Document'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async UpdateUserDocument(UserDocument, id) {
        try {
            const data = await this.ProviderService.UpdateUserDocument(id, UserDocument);
            const userDocuments = await this.UserDocumentModel.findOne({ where: { id }, });
            if ((userDocuments === null || userDocuments === void 0 ? void 0 : userDocuments.user_id) && UserDocument.status == options_1.OptionsMessage.USER_DOCUMENT.Approved) {
                let user_id = userDocuments === null || userDocuments === void 0 ? void 0 : userDocuments.user_id;
                const userDocuments2 = await this.UserDocumentModel.find({ where: { user_id: user_id }, });
                const isAllApproved = userDocuments2.every((doc) => doc.status === options_1.OptionsMessage.USER_DOCUMENT.Approved);
                if (isAllApproved) {
                    let response = await this.UserModel.update(user_id, { status: options_1.OptionsMessage.PROVIDER_STATUS.Approved });
                    const notificationTitle = "Document Approved";
                    const notificationDescription = `Your document request has been approved.`;
                    const dataPayload = await this.NotificationModel.save({
                        title: notificationTitle,
                        description: notificationDescription,
                        user_id: response.id,
                        click_event: 'document',
                        createdAt: new Date(),
                    });
                    const deviceToken = response.device_token;
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
            }
            if ((userDocuments === null || userDocuments === void 0 ? void 0 : userDocuments.user_id) && UserDocument.status == options_1.OptionsMessage.USER_DOCUMENT.Rejected) {
                let user_id = userDocuments.user_id;
                let response = await this.UserModel.update(user_id, { status: options_1.OptionsMessage.PROVIDER_STATUS.Rejected });
            }
            return { status: true, message: common_messages_1.CommonMessages.upload_data('Document'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async changePassword(req) {
        try {
            let { old_pass, new_pass, confirm_pass } = req.body;
            const user_id = req.user.id;
            const data = await this.ProviderService.changePassword(user_id, old_pass, new_pass, confirm_pass);
            return { status: true, message: common_messages_1.CommonMessages.PWD_CHANGE, data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getUserProfile(req) {
        try {
            const user_id = req.user.id;
            const data = await this.ProviderService.getUserData(user_id);
            return { status: true, message: common_messages_1.CommonMessages.GET_DATA('Profile'), data };
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
};
__decorate([
    (0, common_1.Get)('/provider/list'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProviderController.prototype, "getUserList", null);
__decorate([
    (0, common_1.Get)('/provider/alllist'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProviderController.prototype, "getAllprovider", null);
__decorate([
    (0, common_1.Get)('/user/alllist'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProviderController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Get)('/provider/get/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProviderController.prototype, "getUserbyId", null);
__decorate([
    (0, common_1.Post)('/provider/create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProviderController.prototype, "createUserdata", null);
__decorate([
    (0, common_1.Put)('/provider/update/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ProviderController.prototype, "updateUserdata", null);
__decorate([
    (0, common_1.Delete)('/provider/delete/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProviderController.prototype, "deleteUserdata", null);
__decorate([
    (0, common_1.Delete)('/provider/bulkdelete'),
    __param(0, (0, common_1.Body)('ids')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], ProviderController.prototype, "bulkDeletedata", null);
__decorate([
    (0, common_1.Patch)('provider/export'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProviderController.prototype, "exportListToXLSX", null);
__decorate([
    (0, common_1.Get)('getuserdocument/:id'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ProviderController.prototype, "UserDocument", null);
__decorate([
    (0, common_1.Post)('uploaddocument'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProviderController.prototype, "uploaddocument", null);
__decorate([
    (0, common_1.Put)('updateuserdocument/:id'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ProviderController.prototype, "UpdateUserDocument", null);
__decorate([
    (0, common_1.Put)('changepassword'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProviderController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Get)('admin/profile'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProviderController.prototype, "getUserProfile", null);
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
], ProviderController.prototype, "uploadFiles", null);
ProviderController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(1, (0, typeorm_1.InjectRepository)(user_schema_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(required_doc_schema_1.Required_doc)),
    __param(3, (0, typeorm_1.InjectRepository)(email_templates_schema_1.EmailTemplate)),
    __param(4, (0, typeorm_1.InjectRepository)(user_document_schema_1.User_document)),
    __param(5, (0, typeorm_1.InjectRepository)(notification_schema_1.Notification)),
    __param(6, (0, typeorm_1.InjectRepository)(order_schema_1.Order)),
    __param(7, (0, typeorm_1.InjectRepository)(rating_schema_1.Rating)),
    __param(8, (0, typeorm_1.InjectRepository)(wallet_req_schema_1.Wallet_req)),
    __param(9, (0, typeorm_1.InjectRepository)(subscription_schema_1.Subscription)),
    __metadata("design:paramtypes", [provider_service_1.ProviderService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ProviderController);
exports.ProviderController = ProviderController;
//# sourceMappingURL=provider.controller.js.map