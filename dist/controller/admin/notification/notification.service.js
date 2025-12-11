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
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_schema_1 = require("../../../schema/product.schema");
const common_util_1 = require("../../../common/common.util");
const product_request_schema_1 = require("../../../schema/product_request.schema");
const user_schema_1 = require("../../../schema/user.schema");
const user_location_schema_1 = require("../../../schema/user_location.schema");
const rating_schema_1 = require("../../../schema/rating.schema");
const wishlist_schema_1 = require("../../../schema/wishlist.schema");
const notification_schema_1 = require("../../../schema/notification.schema");
const wallet_req_schema_1 = require("../../../schema/wallet_req.schema");
const setting_schema_1 = require("../../../schema/setting.schema");
const dotenv = require("dotenv");
dotenv.config();
const admin = require("firebase-admin");
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CREDENTIALS || '{}')),
    });
}
let NotificationService = class NotificationService {
    constructor(ProductModel, ProductRequestModel, UserRequestModel, UserLocationModel, RatingModel, WishlistModel, NotificationModel, Wallet_req, Setting) {
        this.ProductModel = ProductModel;
        this.ProductRequestModel = ProductRequestModel;
        this.UserRequestModel = UserRequestModel;
        this.UserLocationModel = UserLocationModel;
        this.RatingModel = RatingModel;
        this.WishlistModel = WishlistModel;
        this.NotificationModel = NotificationModel;
        this.Wallet_req = Wallet_req;
        this.Setting = Setting;
    }
    async sendPushNotification(payload) {
        try {
            await this.NotificationModel.save({
                title: payload.title,
                description: payload.description,
                user_type: payload.user_type,
                image: payload.image,
                createdAt: new Date(),
            });
            let roleIds = [];
            if (payload.user_type === 'provider') {
                roleIds = [2];
            }
            else if (payload.user_type === 'customer') {
                roleIds = [3];
            }
            else if (payload.user_type === 'both') {
                roleIds = [2, 3];
            }
            else {
                console.error('Invalid user_type provided.');
                return;
            }
            const userTokens = await this.UserRequestModel.find({
                where: { user_role: (0, typeorm_2.In)(roleIds) },
                select: ['id', 'device_token'],
            });
            const deviceTokens = userTokens.map((user) => user.device_token).filter((token) => !!token);
            console.log(deviceTokens);
            if (deviceTokens.length === 0) {
                console.log('No valid device tokens found.');
            }
            else {
                const chunkSize = 50;
                const chunks = [];
                for (let i = 0; i < deviceTokens.length; i += chunkSize) {
                    chunks.push(deviceTokens.slice(i, i + chunkSize));
                }
                let totalSuccess = 0;
                let totalFailure = 0;
                for (const chunk of chunks) {
                    const message = {
                        notification: {
                            title: payload.title,
                            body: payload.description,
                            image: payload.image,
                        },
                        tokens: chunk,
                    };
                    const response = await admin.messaging().sendEachForMulticast(message);
                    totalSuccess += response.successCount;
                    totalFailure += response.failureCount;
                    response.responses.forEach((res, index) => {
                        var _a;
                        if (!res.success) {
                            console.error(`Failed to send notification to token ${chunk[index]}:`, ((_a = res.error) === null || _a === void 0 ? void 0 : _a.message) || 'Unknown error');
                        }
                    });
                }
                console.log(`Push Notification Results: ${totalSuccess} sent successfully, ${totalFailure} failed.`);
            }
        }
        catch (error) {
            console.error('Error sending push notification:', error.message || error);
            throw new Error('Failed to send push notifications');
        }
    }
    async getAllPages(page = 1, pageSize = 10, search = '') {
        try {
            const { limit, offset } = common_util_1.default.getPagination(page, pageSize);
            const whereCondition = {};
            if (search) {
                whereCondition.title = (0, typeorm_2.Like)(`%${search}%`);
            }
            const [pages, count] = await this.NotificationModel.findAndCount({
                where: whereCondition,
                skip: offset,
                take: limit,
                order: { createdAt: 'DESC' },
            });
            const paginatedData = common_util_1.default.getPagingData({ count, rows: pages }, page, limit);
            return paginatedData;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
};
NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_schema_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(product_request_schema_1.ProductRequest)),
    __param(2, (0, typeorm_1.InjectRepository)(user_schema_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(user_location_schema_1.User_location)),
    __param(4, (0, typeorm_1.InjectRepository)(rating_schema_1.Rating)),
    __param(5, (0, typeorm_1.InjectRepository)(wishlist_schema_1.ProviderWishlist)),
    __param(6, (0, typeorm_1.InjectRepository)(notification_schema_1.Notification)),
    __param(7, (0, typeorm_1.InjectRepository)(wallet_req_schema_1.Wallet_req)),
    __param(8, (0, typeorm_1.InjectRepository)(setting_schema_1.Setting)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], NotificationService);
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification.service.js.map