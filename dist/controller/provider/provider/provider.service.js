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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_schema_1 = require("../../../schema/user.schema");
const bcrypt = require("bcryptjs");
const common_util_1 = require("../../../common/common.util");
const options_1 = require("../../../common/options");
const common_messages_1 = require("../../../common/common-messages");
const user_document_schema_1 = require("../../../schema/user_document.schema");
const report_schema_1 = require("../../../schema/report.schema");
const rating_schema_1 = require("../../../schema/rating.schema");
const admin = require("firebase-admin");
const dotenv = require("dotenv");
const notification_schema_1 = require("../../../schema/notification.schema");
const subscription_schema_1 = require("../../../schema/subscription.schema");
const product_request_schema_1 = require("../../../schema/product_request.schema");
const product_schema_1 = require("../../../schema/product.schema");
const wallet_req_schema_1 = require("../../../schema/wallet_req.schema");
dotenv.config();
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CREDENTIALS || '{}')),
    });
}
let UserService = class UserService {
    constructor(UserModel, UserDocumentModel, Report, Rating, NotificationModel, Subscription, ProductReq, product, wallet_req) {
        this.UserModel = UserModel;
        this.UserDocumentModel = UserDocumentModel;
        this.Report = Report;
        this.Rating = Rating;
        this.NotificationModel = NotificationModel;
        this.Subscription = Subscription;
        this.ProductReq = ProductReq;
        this.product = product;
        this.wallet_req = wallet_req;
    }
    async getUserData(id) {
        try {
            const user = await this.UserModel.findOne({
                where: { user_role: options_1.OptionsMessage.USER_ROLE.PROVIDER, id: id }
            });
            console.log(user);
            if (!user) {
                throw new Error(common_messages_1.CommonMessages.notFound('Provider'));
            }
            const { password, subscription_id } = user, userData = __rest(user, ["password", "subscription_id"]);
            let response = Object.assign(Object.assign({}, userData), { is_plan: true, is_expired: false, subscription: {
                    id: 0,
                    name: "Premium Plan",
                    ar_name: "Premium Plan",
                    duration: "Yearly Plan",
                    duration_day: "365",
                    amount: 500,
                    features: "",
                    status: true,
                    createdAt: "2025-12-08T14:01:04.265Z",
                    updatedAt: "2025-12-08T14:01:04.265Z",
                } });
            if (subscription_id) {
                const subscription = await this.Subscription.findOne({ where: { id: subscription_id } });
                const txn_id = await this.wallet_req.findOne({
                    where: { user_id: id, order_type: "Subscription" },
                    order: { id: 'DESC' }
                });
                if (subscription) {
                    response.subscription = subscription;
                    response.txn_id = (txn_id === null || txn_id === void 0 ? void 0 : txn_id.transaction_id) || null;
                }
            }
            const customerRatings = await this.Rating.find({ where: { provider_id: id } });
            const totalRatings = customerRatings.length;
            const averageRating = totalRatings > 0
                ? Math.round((customerRatings.reduce((sum, rating) => sum + parseFloat(rating.rating || "0"), 0) / totalRatings) * 2) / 2
                : 0;
            response.totalRatings = totalRatings;
            response.averageRating = averageRating.toFixed(2);
            const approvedRequests = await this.ProductReq.find({
                where: { user_id: id, deletedAt: null },
            });
            const productIds = approvedRequests.map(req => req.product_id);
            const validProductsCount = await this.product.count({
                where: {
                    id: (0, typeorm_2.In)(productIds),
                    deletedAt: null
                }
            });
            response.product_count = validProductsCount;
            return response;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getUserList() {
        try {
            const users = await this.UserModel.find({ where: { user_role: options_1.OptionsMessage.USER_ROLE.PROVIDER } });
            if (!users || users.length === 0) {
                throw new Error(common_messages_1.CommonMessages.notFound('Provider'));
            }
            return users;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getAllPages(page = 1, pageSize = 10, search = '') {
        try {
            const { limit, offset } = common_util_1.default.getPagination(page, pageSize);
            const [pages, count] = await this.UserModel.findAndCount({
                where: Object.assign({ user_role: options_1.OptionsMessage.USER_ROLE.PROVIDER }, (search && { name: (0, typeorm_2.Like)(`%${search}%`) })),
                skip: offset,
                take: limit,
                order: { createdAt: 'DESC' }
            });
            const paginatedData = common_util_1.default.getPagingData({ count, rows: pages }, page, limit);
            return paginatedData;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async createUserData(data) {
        try {
            data.user_role = options_1.OptionsMessage.USER_ROLE.PROVIDER;
            const user = await this.UserModel.findOne({ where: { phone_num: data.phone_num } });
            if (user) {
                throw new Error(common_messages_1.CommonMessages.alreadyFound('Provider'));
            }
            let newUser = await this.UserModel.create(data);
            newUser = await this.UserModel.save(newUser);
            return newUser;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async updateUserData(id, updateData) {
        try {
            const user = await this.UserModel.findOne({ where: { id: id } });
            if (!user) {
                throw new Error(common_messages_1.CommonMessages.notFound('Provider'));
            }
            let response = await this.UserModel.update(id, updateData);
            if (response[0] === 0) {
                throw new Error("No user data was updated.");
            }
            return response;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async updateUserDataStatus(user_id, updateData) {
        try {
            const user = await this.UserModel.findOne({ where: { id: user_id } });
            if (!user) {
                throw new Error(common_messages_1.CommonMessages.notFound('Provider'));
            }
            let response = await this.UserModel.update(user_id, updateData);
            if (response[0] === 0) {
                throw new Error("No user data was updated.");
            }
            return response;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async deleteUserData(id) {
        try {
            const user = await this.UserModel.findOne({ where: { id: id } });
            if (!user) {
                throw new Error(common_messages_1.CommonMessages.notFound('Provider'));
            }
            await this.UserModel.softDelete(id);
            return user;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async createMultiUserDocument(documents, is_resubmit, user_id) {
        try {
            const processedDocuments = [];
            if (is_resubmit) {
                for (const document of documents) {
                    const existingDocument = await this.UserDocumentModel.findOne({ where: { user_id: document.user_id, required_doc_id: document.required_doc_id, }, });
                    if (existingDocument) {
                        existingDocument.document = document.document;
                        existingDocument.status = options_1.OptionsMessage.USER_DOCUMENT.Requested;
                        const updatedDocument = await this.UserDocumentModel.save(existingDocument);
                        processedDocuments.push(updatedDocument);
                    }
                    else {
                        const newDocument = await this.UserDocumentModel.save(document);
                        processedDocuments.push(newDocument);
                    }
                }
                let response = await this.UserModel.update(user_id, { status: options_1.OptionsMessage.PROVIDER_STATUS.Pending });
                await this.UserModel.save(response);
            }
            else {
                const newDocuments = await this.UserDocumentModel.save(documents);
                processedDocuments.push(...newDocuments);
            }
            return processedDocuments;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async createUserDocument(data) {
        try {
            let response = await this.UserDocumentModel.create(data);
            response = await this.UserDocumentModel.save(response);
            return response;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async GetUserDocument(user_id) {
        try {
            let response = await this.UserDocumentModel.find({ where: { user_id: user_id } });
            response = await this.UserDocumentModel.save(response);
            return response;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async UpdateUserDocument(id, data) {
        try {
            let response = await this.UserDocumentModel.update(id, data);
            response = await this.UserDocumentModel.save(response);
            return response;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async changePassword(id, currentPassword, newPassword, confirmPassword) {
        try {
            if (newPassword !== confirmPassword) {
                throw new Error(common_messages_1.CommonMessages.PWD_NOT_MATCH);
            }
            const user = await this.UserModel.findOne({ where: { id: id } });
            if (!user) {
                throw new Error(common_messages_1.CommonMessages.notFound('Provider'));
            }
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                throw new Error('Current password is incorrect');
            }
            const salt = await bcrypt.genSalt();
            const hashedNewPassword = await bcrypt.hash(newPassword, salt);
            user.password = hashedNewPassword;
            await this.UserModel.save(user);
            return user;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async reportCustomer(data) {
        try {
            const user = await this.UserModel.findOne({ where: { dialing_code: data.dial_code, phone_num: data.phone_num } });
            if (!user) {
                return {
                    status: false,
                    message: 'invalid customer!!',
                };
            }
            const newEntry = this.Report.create(data);
            await this.Report.save(newEntry);
            return {
                status: true,
                message: 'report added successful',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async reviewCustomer(data) {
        try {
            const existingReview = await this.Rating.findOne({
                where: {
                    customer_id: data === null || data === void 0 ? void 0 : data.customer_id,
                    order_id: data.order_id,
                },
            });
            console.log(existingReview, "existingReview");
            console.log(data);
            const realUser = await this.UserModel.findOne({ where: { id: existingReview === null || existingReview === void 0 ? void 0 : existingReview.customer_id } });
            const notificationTitle = "Customer Rating";
            const notificationDescription = `A provider has given a review. Please check the details`;
            const dataPayload = await this.NotificationModel.save({
                title: notificationTitle,
                description: notificationDescription,
                user_id: realUser.id,
                click_event: 'rating',
                createdAt: new Date(),
            });
            const deviceToken = realUser === null || realUser === void 0 ? void 0 : realUser.device_token;
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
            if (existingReview) {
                console.log('hyyyyyyyyyyyyyyy');
                await this.Rating.update(existingReview.id, {
                    rating: data.rating,
                    review: data.review,
                });
                return { message: 'Review updated successfully', updated: true };
            }
            else {
                console.log('hyyyyyyyyyyyyyyy');
                const newEntry = this.Rating.create(data);
                await this.Rating.save(newEntry);
                return { message: 'Review created successfully', created: true };
            }
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getAllNotificationPages(provider, page = 1, pageSize = 10, search = '') {
        try {
            const { limit, offset } = common_util_1.default.getPagination(page, pageSize);
            const [pages, count] = await this.NotificationModel.findAndCount({
                where: [
                    { user_id: provider },
                    { user_id: null, user_type: 'provider' },
                ],
                skip: offset,
                take: limit,
                order: { createdAt: 'DESC' }
            });
            const paginatedData = common_util_1.default.getPagingData({ count, rows: pages }, page, limit);
            return paginatedData;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
};
UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_schema_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(user_document_schema_1.User_document)),
    __param(2, (0, typeorm_1.InjectRepository)(report_schema_1.Report)),
    __param(3, (0, typeorm_1.InjectRepository)(rating_schema_1.Rating)),
    __param(4, (0, typeorm_1.InjectRepository)(notification_schema_1.Notification)),
    __param(5, (0, typeorm_1.InjectRepository)(subscription_schema_1.Subscription)),
    __param(6, (0, typeorm_1.InjectRepository)(product_request_schema_1.ProductRequest)),
    __param(7, (0, typeorm_1.InjectRepository)(product_schema_1.Product)),
    __param(8, (0, typeorm_1.InjectRepository)(wallet_req_schema_1.Wallet_req)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=provider.service.js.map