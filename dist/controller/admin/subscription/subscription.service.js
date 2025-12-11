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
exports.SubscriptionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const common_util_1 = require("../../../common/common.util");
const common_messages_1 = require("../../../common/common-messages");
const subscription_schema_1 = require("../../../schema/subscription.schema");
const subscription_orders_schema_1 = require("../../../schema/subscription.orders.schema");
const user_schema_1 = require("../../../schema/user.schema");
const rating_schema_1 = require("../../../schema/rating.schema");
const order_schema_1 = require("../../../schema/order.schema");
const moment = require("moment-timezone");
let SubscriptionService = class SubscriptionService {
    constructor(SubscriptionModel, SubscriptionOrder, RatingModel, Orders, UserModel) {
        this.SubscriptionModel = SubscriptionModel;
        this.SubscriptionOrder = SubscriptionOrder;
        this.RatingModel = RatingModel;
        this.Orders = Orders;
        this.UserModel = UserModel;
    }
    async getData(id) {
        try {
            const Subscription = await this.SubscriptionModel.findOne({ where: { id: id } });
            if (!Subscription) {
                throw new Error(common_messages_1.CommonMessages.notFound('Subscription'));
            }
            return Subscription;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getDataByUserId(id) {
        try {
            const userSubscriptions = await this.UserModel.findOne({
                where: { id: id },
                select: [
                    'id',
                    'name',
                    'email',
                    'dialing_code',
                    'image_url',
                    'address_one',
                    'address_two',
                    'phone_num',
                    'createdAt',
                    'subscription_id',
                    'expiry_date',
                ],
            });
            if (!userSubscriptions) {
                throw new Error(common_messages_1.CommonMessages.notFound('User subscription'));
            }
            const subscriptionData = userSubscriptions.subscription_id
                ? await this.SubscriptionModel.findOne({
                    where: { id: userSubscriptions.subscription_id },
                })
                : null;
            const ratings = await this.RatingModel.find({
                where: { provider_id: id },
            });
            const totalRatings = ratings.reduce((sum, rating) => {
                const ratingValue = Number(rating.rating);
                if (isNaN(ratingValue)) {
                    console.warn(`Invalid rating value: ${rating.rating}`);
                    return sum;
                }
                return sum + ratingValue;
            }, 0);
            const averageRating = ratings.length > 0 ? totalRatings / ratings.length : 0;
            const roundedAverageRating = Math.round(averageRating * 2) / 2;
            const orders = await this.Orders.find({
                where: { user_id: id, status: 'DELIVERED' },
            });
            const subscriptionOrder = await this.SubscriptionOrder.find({
                where: { user_id: id },
            });
            const userIds = subscriptionOrder.map(order => order.user_id);
            const users = await this.UserModel.find({
                where: { id: (0, typeorm_2.In)(userIds) },
                select: ['id', 'name'],
            });
            const userMap = users.reduce((acc, user) => {
                acc[user.id] = user.name;
                return acc;
            }, {});
            const currentDate = new Date();
            const subscriptionOrderWithDetails = subscriptionOrder.map(order => {
                let sub_status = 'Expired';
                if (userSubscriptions.expiry_date) {
                    const expiryDate = new Date(userSubscriptions.expiry_date);
                    if (expiryDate > currentDate) {
                        sub_status = 'Active';
                    }
                }
                return Object.assign(Object.assign({}, order), { sub_status, user_name: userMap[order.user_id] || null });
            });
            const ordersCount = orders.length;
            const ratingCount = ratings.length;
            const response = Object.assign(Object.assign({}, userSubscriptions), { subscriptionDetails: subscriptionData || null, ratingCount: ratingCount, ordersCount: ordersCount, averageRating: roundedAverageRating, subscriptionOrder: subscriptionOrderWithDetails, amount: subscriptionData.amount });
            return response;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getAllPages(page = 1, pageSize = 10, search = '') {
        try {
            const { limit, offset } = common_util_1.default.getPagination(page, pageSize);
            const [pages, count] = await this.SubscriptionModel.findAndCount({
                where: search
                    ? [
                        { name: (0, typeorm_2.Like)(`%${search}%`) },
                        { ar_name: (0, typeorm_2.Like)(`%${search}%`) },
                    ]
                    : {},
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
    async getDatabyid(id) {
        try {
            const Subscription = await this.SubscriptionModel.findOne({ where: { id: id } });
            if (!Subscription) {
                throw new Error(common_messages_1.CommonMessages.notFound('Subscription'));
            }
            return Subscription;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async createData(data) {
        try {
            data.createdAt = moment.tz('Asia/Riyadh').format('YYYY-MM-DD HH:mm:ss');
            let newSubscription = await this.SubscriptionModel.create(data);
            newSubscription = await this.SubscriptionModel.save(newSubscription);
            return newSubscription;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async updateData(id, updateData) {
        try {
            let response = await this.SubscriptionModel.update(id, updateData);
            if (response[0] === 0) {
                throw new Error("No Subscription data was updated.");
            }
            return response;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async deleteData(id) {
        try {
            const Subscription = await this.SubscriptionModel.findOne({ where: { id: id } });
            if (!Subscription) {
                throw new Error(common_messages_1.CommonMessages.notFound('Subscription'));
            }
            await this.SubscriptionModel.softDelete(id);
            return Subscription;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async bulkDeletedata(ids) {
        try {
            const SubscriptionModel = await this.SubscriptionModel.find({ where: { id: (0, typeorm_2.In)(ids) } });
            if (SubscriptionModel.length === 0) {
                throw new Error(common_messages_1.CommonMessages.notFound('subscription'));
            }
            const result = await this.SubscriptionModel.softDelete(ids);
            return result.affected || 0;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getsubscriberList(page = 1, pageSize = 10, s = '', status = '') {
        try {
            const { limit, offset } = common_util_1.default.getPagination(page, pageSize);
            const [pages, count] = await this.SubscriptionOrder.findAndCount({
                skip: offset,
                take: limit,
                order: { createdAt: 'DESC' },
            });
            const enrichedData = await Promise.all(pages.map(async (order) => {
                const subscription = await this.SubscriptionModel.findOne({
                    where: { id: order.subscription_id },
                });
                const user = await this.UserModel.findOne({
                    where: { id: order.user_id },
                });
                const expiry_date = user ? user.expiry_date : null;
                const now = new Date();
                const sub_status = expiry_date && new Date(expiry_date) > now ? 'active' : 'expired';
                return Object.assign(Object.assign({}, order), { plan_type: subscription ? subscription.name : 'N/A', user_name: user ? user.name : 'N/A', image: user ? user.image_url : 'N/A', expiry_date: expiry_date, sub_status: sub_status });
            }));
            const now = new Date();
            const filteredData = enrichedData.filter((item) => {
                if (status === 'active') {
                    return item.sub_status === 'active';
                }
                else if (status === 'expired') {
                    return item.sub_status === 'expired';
                }
                return true;
            }).filter((item) => {
                if (s) {
                    const searchTerm = s.toLowerCase();
                    const planType = item.plan_type ? item.plan_type.toLowerCase() : '';
                    const userName = item.user_name ? item.user_name.toLowerCase() : '';
                    return (planType.includes(searchTerm) || userName.includes(searchTerm));
                }
                return true;
            });
            const paginatedData = common_util_1.default.getPagingData({ count: filteredData.length, rows: filteredData }, page, limit);
            return {
                status: true,
                message: 'Subscriber list has been retrieved successfully!',
                data: paginatedData,
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
};
SubscriptionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscription_schema_1.Subscription)),
    __param(1, (0, typeorm_1.InjectRepository)(subscription_orders_schema_1.SubscriptionOrder)),
    __param(2, (0, typeorm_1.InjectRepository)(rating_schema_1.Rating)),
    __param(3, (0, typeorm_1.InjectRepository)(order_schema_1.Order)),
    __param(4, (0, typeorm_1.InjectRepository)(user_schema_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SubscriptionService);
exports.SubscriptionService = SubscriptionService;
//# sourceMappingURL=subscription.service.js.map