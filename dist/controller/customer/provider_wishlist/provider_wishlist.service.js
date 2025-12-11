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
exports.ProductWishListService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const common_util_1 = require("../../../common/common.util");
const wishlist_schema_1 = require("../../../schema/wishlist.schema");
const user_schema_1 = require("../../../schema/user.schema");
const rating_schema_1 = require("../../../schema/rating.schema");
const report_schema_1 = require("../../../schema/report.schema");
const admin = require("firebase-admin");
const dotenv = require("dotenv");
const notification_schema_1 = require("../../../schema/notification.schema");
dotenv.config();
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CREDENTIALS || '{}')),
    });
}
let ProductWishListService = class ProductWishListService {
    constructor(ProviderWishlist, Report, User, Rating, NotificationModel) {
        this.ProviderWishlist = ProviderWishlist;
        this.Report = Report;
        this.User = User;
        this.Rating = Rating;
        this.NotificationModel = NotificationModel;
    }
    async createData(data) {
        try {
            const { user_id, provider_id } = data;
            const existingEntry = await this.ProviderWishlist.findOne({
                where: { user_id, provider_id },
            });
            if (existingEntry) {
                await this.ProviderWishlist.delete(existingEntry.id);
                return { message: 'Wishlist entry removed', action: 'removed' };
            }
            else {
                const newEntry = this.ProviderWishlist.create(data);
                await this.ProviderWishlist.save(newEntry);
                return { message: 'Wishlist entry added', action: 'added' };
            }
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getAllPages(page = 1, pageSize = 10, search = '', user_id) {
        try {
            const { limit, offset } = common_util_1.default.getPagination(page, pageSize);
            const [pages, count] = await this.ProviderWishlist.findAndCount({
                where: { user_id },
                skip: offset,
                take: limit,
                order: { createdAt: 'DESC' },
            });
            const providerIds = pages.map((item) => item.provider_id);
            if (providerIds.length === 0) {
                return {
                    status: true,
                    message: 'Wishlist list has been got successfully!',
                    data: common_util_1.default.getPagingData({ count: 0, rows: [] }, page, limit),
                };
            }
            let userDetailsQuery = this.User.createQueryBuilder('user')
                .where('user.id IN (:...providerIds)', { providerIds });
            if (search) {
                userDetailsQuery = userDetailsQuery.andWhere('user.name LIKE :search', {
                    search: `%${search}%`,
                });
            }
            const userDetails = await userDetailsQuery.getMany();
            const filteredProviderIds = userDetails.map((user) => user.id);
            const filteredPages = pages.filter((wishlistItem) => filteredProviderIds.includes(wishlistItem.provider_id));
            if (filteredProviderIds.length === 0) {
                return {
                    status: true,
                    message: 'Wishlist list has been got successfully!',
                    data: common_util_1.default.getPagingData({ count: 0, rows: [] }, page, limit),
                };
            }
            const ratings = await this.Rating.createQueryBuilder('rating')
                .where('rating.provider_id IN (:...providerIds)', { providerIds: filteredProviderIds })
                .getMany();
            const wishlistWithUserDetails = filteredPages.map((wishlistItem) => {
                const userDetail = userDetails.find((user) => user.id === wishlistItem.provider_id);
                const providerRatings = ratings.filter((rating) => rating.provider_id === wishlistItem.provider_id);
                const totalCount = providerRatings.length.toString();
                const averageRating = totalCount !== "0"
                    ? (providerRatings.reduce((sum, r) => sum + r.rating, 0) / parseInt(totalCount)).toFixed(2)
                    : "0.00";
                return Object.assign(Object.assign({}, wishlistItem), { userDetail: userDetail || null, totalRatingCount: totalCount, averageRating, isWish: true });
            });
            const paginatedData = common_util_1.default.getPagingData({ count: wishlistWithUserDetails.length, rows: wishlistWithUserDetails }, page, limit);
            return {
                status: true,
                message: 'Wishlist list has been got successfully!',
                data: paginatedData,
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async reportProvider(data) {
        try {
            const user = await this.User.findOne({ where: { phone_num: data.phone_num, dialing_code: data.dial_code } });
            if (!user) {
                return {
                    status: false,
                    message: 'invalid provider!!',
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
    async reviewProvider(data) {
        try {
            const existingReview = await this.Rating.findOne({
                where: {
                    provider_id: data.provider_id,
                    order_id: data.order_id,
                },
            });
            const realUser = await this.User.findOne({ where: { id: data.provider_id } });
            const notificationTitle = "Provider Rating";
            const notificationDescription = `A customer has given a review. Please check the details`;
            const dataPayload = await this.NotificationModel.save({
                title: notificationTitle,
                description: notificationDescription,
                user_id: realUser.id,
                click_event: 'rating',
                createdAt: new Date(),
            });
            const deviceToken = realUser.device_token;
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
            if (existingReview) {
                await this.Rating.update(existingReview.id, {
                    rating: data.rating,
                    review: data.review,
                });
                return { message: 'Review updated successfully', updated: true };
            }
            else {
                const newEntry = this.Rating.create(data);
                await this.Rating.save(newEntry);
                return { message: 'Review created successfully', created: true };
            }
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
};
ProductWishListService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(wishlist_schema_1.ProviderWishlist)),
    __param(1, (0, typeorm_1.InjectRepository)(report_schema_1.Report)),
    __param(2, (0, typeorm_1.InjectRepository)(user_schema_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(rating_schema_1.Rating)),
    __param(4, (0, typeorm_1.InjectRepository)(notification_schema_1.Notification)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ProductWishListService);
exports.ProductWishListService = ProductWishListService;
//# sourceMappingURL=provider_wishlist.service.js.map