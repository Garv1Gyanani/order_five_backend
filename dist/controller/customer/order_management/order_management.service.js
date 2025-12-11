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
exports.OrderService = void 0;
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
const order_schema_1 = require("../../../schema/order.schema");
const wallet_req_schema_1 = require("../../../schema/wallet_req.schema");
const setting_schema_1 = require("../../../schema/setting.schema");
const shapefile = require("shapefile");
const path = require("path");
const notification_schema_1 = require("../../../schema/notification.schema");
const admin = require("firebase-admin");
const dotenv = require("dotenv");
const moment = require("moment-timezone");
dotenv.config();
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CREDENTIALS || '{}')),
    });
}
let OrderService = class OrderService {
    constructor(ProductModel, ProductRequestModel, UserRequestModel, UserLocationModel, RatingModel, WishlistModel, OrderModel, Wallet_req, Setting, NotificationModel) {
        this.ProductModel = ProductModel;
        this.ProductRequestModel = ProductRequestModel;
        this.UserRequestModel = UserRequestModel;
        this.UserLocationModel = UserLocationModel;
        this.RatingModel = RatingModel;
        this.WishlistModel = WishlistModel;
        this.OrderModel = OrderModel;
        this.Wallet_req = Wallet_req;
        this.Setting = Setting;
        this.NotificationModel = NotificationModel;
    }
    async loadRoadData(shapefilePath) {
        const roads = [];
        return new Promise((resolve, reject) => {
            shapefile
                .open(shapefilePath)
                .then((source) => {
                source
                    .read()
                    .then(function process(result) {
                    if (result.done) {
                        resolve(roads);
                        return;
                    }
                    roads.push(result.value);
                    return source.read().then(process);
                })
                    .catch(reject);
            })
                .catch(reject);
        });
    }
    buildGraph(roads) {
        const graph = {};
        roads.forEach((road) => {
            const { start, end, distance } = road.properties;
            if (!graph[start])
                graph[start] = [];
            graph[start].push({ to: end, distance });
            if (!graph[end])
                graph[end] = [];
            graph[end].push({ to: start, distance });
        });
        return graph;
    }
    calculateRoute(graph, start, end) {
        const distance = Math.sqrt(Math.pow(start.lat - end.lat, 2) + Math.pow(start.lon - end.lon, 2)) * 111 * 1000;
        const duration = distance / 50;
        return { distance, duration };
    }
    formatDistance(distance) {
        return `${distance.toFixed(2)} km`;
    }
    formatDuration(duration) {
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        return hours > 0
            ? `${hours}h ${minutes}m`
            : `${minutes}m`;
    }
    async getAverageRatings(providerIds) {
        return await this.RatingModel
            .createQueryBuilder('rating')
            .select('rating.provider_id', 'provider_id')
            .addSelect('AVG(rating.rating)', 'averageRating')
            .addSelect('COUNT(rating.id)', 'totalRatingCount')
            .where('rating.provider_id IN (:...providerIds)', { providerIds })
            .groupBy('rating.provider_id')
            .getRawMany();
    }
    async findNearbyProviders(productId, latitude, longitude, filter, rating, userLogid, s = '', page, size) {
        const shapefilePath = path.join(__dirname, '../../../../src/common/YE_osm_roads_lines_20230523.shp');
        console.log(__dirname, "__dirname");
        console.log(shapefilePath, "shapefilePath");
        const roads = await this.loadRoadData(shapefilePath);
        const graph = this.buildGraph(roads);
        const userwallet = await this.UserRequestModel.findOne({ where: { id: userLogid } });
        const useraddress = await this.UserLocationModel.findOne({ where: { user_id: userLogid, default: 1 } });
        const setting = await this.Setting.findOne({ where: { key: "platform_charge_per_order" } });
        const productRequests = await this.ProductRequestModel.find({ where: { product_id: productId, status: 'Approved' } });
        const product = await this.ProductModel.findOne({ where: { id: productId } });
        if (!productRequests.length) {
            throw new common_1.NotFoundException('No providers found for this product');
        }
        const userIds = productRequests.map((req) => req.user_id);
        const userLocations = await this.UserLocationModel
            .createQueryBuilder('user_location')
            .where('user_location.user_id IN (:...userIds)', { userIds })
            .getMany();
        if (!userLocations.length) {
            throw new common_1.NotFoundException('No location data available for these providers');
        }
        const wishlist = await this.WishlistModel.find({ where: { user_id: userLogid } });
        const wishlistProviderIds = wishlist.map((item) => item.provider_id);
        const ratings = await this.RatingModel.createQueryBuilder('rating')
            .where('rating.provider_id IN (:...userIds)', { userIds: userLocations.map((user) => user.user_id) })
            .getMany();
        const RatingModel = await this.getAverageRatings(userIds);
        let minRating = 0;
        let maxRating = 5;
        if (typeof rating === 'string' && rating.includes('-')) {
            const ratingRange = rating.split('-');
            minRating = parseInt(ratingRange[0], 10);
            maxRating = parseInt(ratingRange[1], 10);
        }
        else if (typeof rating === 'number') {
            minRating = rating;
            maxRating = rating;
        }
        const filteredProviders = await Promise.all(userLocations.map(async (location) => {
            try {
                const { distance, duration } = this.calculateRoute(graph, { lat: latitude, lon: longitude }, { lat: parseFloat(location.latitude), lon: parseFloat(location.longitude) });
                console.log(distance, duration);
                const distanceInKm = distance / 1000;
                if (filter && distanceInKm > filter) {
                    return null;
                }
                const userRatings = ratings.filter((r) => r.provider_id === location.user_id);
                const ratingReal = RatingModel.find((r) => r.provider_id === location.user_id);
                const reviewCount = userRatings.length;
                const averageRating = reviewCount
                    ? Math.round((userRatings.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 2) / 2
                    : 0;
                if (averageRating < minRating || averageRating > maxRating)
                    return null;
                const productRequest = productRequests.find((req) => req.user_id === location.user_id);
                const userDetails = await this.UserRequestModel.findOne({
                    where: {
                        id: location.user_id,
                        current_status: true,
                        name: s ? (0, typeorm_2.Like)(`%${s}%`) : undefined,
                    }
                });
                if (!userDetails)
                    return null;
                const isWish = wishlistProviderIds.includes(location.user_id);
                return {
                    user_id: location.user_id,
                    latitude: location.latitude,
                    longitude: location.longitude,
                    address: location.address,
                    distance: {
                        value: distanceInKm,
                        formatted: this.formatDistance(distance),
                    },
                    travelTime: {
                        value: Math.round(duration / 60),
                        formatted: this.formatDuration(duration),
                    },
                    product,
                    product_charges: productRequest,
                    userDetails,
                    reviewCount,
                    averageRating: (ratingReal === null || ratingReal === void 0 ? void 0 : ratingReal.averageRating)
                        ? (Math.round(ratingReal.averageRating * 2) / 2).toFixed(1)
                        : null,
                    isWish,
                    userwallet: userwallet.wallet_balance,
                    useraddress,
                    plat_form_charge: setting.value,
                };
            }
            catch (error) {
                console.error('Error fetching distance and time for user', location.user_id, error);
                return null;
            }
        }));
        const validProviders = filteredProviders.filter((provider) => provider !== null);
        if (validProviders.length === 0) {
            return {
                status: true,
                message: 'No providers found with the given name or rating',
                data: {
                    totalItems: 0,
                    data: [],
                    totalPages: 0,
                    currentPage: 0,
                },
            };
        }
        const sortedResults = validProviders.sort((a, b) => a.distance.value - b.distance.value);
        const totalItems = sortedResults.length;
        const totalPages = Math.ceil(totalItems / size);
        const offset = (page - 1) * size;
        const paginatedResults = sortedResults.slice(offset, offset + size);
        return {
            status: true,
            message: 'Nearby providers fetched successfully',
            data: {
                totalItems,
                data: paginatedResults,
                totalPages,
                currentPage: page,
            },
        };
    }
    async orderCreate(data) {
        try {
            const orderUUID = `ODI-${Math.random().toString(36).substr(2, Math.floor(Math.random() * (6 - 4 + 1)) + 4).toUpperCase()}`;
            data.order_id = orderUUID;
            const user = await this.UserRequestModel.findOne({ where: { id: data.user_id } });
            if (!user) {
                throw new Error('User not found');
            }
            const product = await this.ProductModel.findOne({ where: { id: data.product_id } });
            if (!product) {
                throw new Error('Product not found');
            }
            const provider = await this.UserRequestModel.findOne({ where: { id: data.provider_id } });
            if (!provider) {
                throw new Error('provider not found');
            }
            const walletBalance = user.wallet_balance || 0;
            const platformCharge = data.platform_charge || 0;
            const totalPrice = data.total_price;
            if (totalPrice <= 0 || platformCharge <= 0) {
                throw new Error('Invalid total price or platform charge');
            }
            if (walletBalance < platformCharge) {
                throw new Error('You do not have enough balance in your wallet');
            }
            user.wallet_balance -= platformCharge;
            data.wallet = platformCharge;
            data.cash = totalPrice;
            data.totalprice = totalPrice;
            data.status = 'UPCOMING';
            await this.UserRequestModel.update(user.id, { wallet_balance: user.wallet_balance });
            data.createdAt = moment.tz('Asia/Riyadh').format('YYYY-MM-DD HH:mm:ss');
            const newOrder = await this.OrderModel.create(data);
            const newOrderRequest = await this.OrderModel.save(newOrder);
            const transaction_id = common_util_1.default.createTransactionId();
            const walletTransaction = this.Wallet_req.create({
                user_id: user.id,
                user_type: 'Customer',
                amount_status: 'Debit',
                wallet_type: 'Online',
                transaction_id,
                currency: 'OMR',
                amount: platformCharge,
                available_amount: user.wallet_balance,
                remark: product.product_name,
                order_type: 'order',
                status: 'Approved',
                date: new Date(),
            });
            await this.Wallet_req.save(walletTransaction);
            const notificationTitle = "Order place";
            const notificationDescription = `Order has been placed.`;
            const dataPayload = await this.NotificationModel.save({
                title: notificationTitle,
                description: notificationDescription,
                user_id: provider.id,
                click_event: 'order',
                createdAt: new Date(),
            });
            const deviceToken = provider.device_token;
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
            return Object.assign(Object.assign({}, newOrderRequest), { product_details: {
                    id: product.id,
                    name: product.product_name,
                    description: product.description_name,
                    image: product.product_img,
                }, provider_details: {
                    id: provider.id,
                    name: provider.name,
                    phone: provider.phone_num,
                    image: provider.image_url,
                } });
        }
        catch (error) {
            throw new Error(`Failed to create order: ${error.message}`);
        }
    }
    async createCashWalletData(data) {
        try {
            if (!data.transaction_id) {
                let transaction_id = common_util_1.default.createTransactionId();
                data.transaction_id = transaction_id;
            }
            data.status = 'Approved';
            data.amount_status = 'Debited';
            let newWalletRequest = await this.Wallet_req.create(data);
            newWalletRequest = await this.Wallet_req.save(newWalletRequest);
            return newWalletRequest;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getOrderList(page = 1, pageSize = 10, search = '', user_id, productNameSearch = '') {
        try {
            const { limit, offset } = common_util_1.default.getPagination(page, pageSize);
            const whereCondition = { user_id };
            const [pages, count] = await this.OrderModel.findAndCount({
                where: whereCondition,
                skip: offset,
                take: limit,
                order: { createdAt: 'DESC' },
            });
            const setting = await this.Setting.findOne({ where: { key: "platform_charge_per_order" } });
            const settingcancel = await this.Setting.findOne({ where: { key: "customer_cancel_fees" } });
            const providerIds = pages.map((order) => order.provider_id);
            const customerIds = pages.map((order) => order.user_id);
            const productIds = pages.map((order) => order.product_id);
            const address = pages.map((order) => order.address_id);
            const cust_review = pages.map((order) => order.id);
            const providers = await this.UserRequestModel.find({
                where: { id: (0, typeorm_2.In)(providerIds) },
            });
            const providers_address = await this.UserLocationModel.find({
                where: { user_id: (0, typeorm_2.In)(providerIds) },
            });
            const address_id = await this.UserLocationModel.find({
                where: { id: (0, typeorm_2.In)(address) },
            });
            const customerReview = await this.RatingModel.find({
                where: { order_id: (0, typeorm_2.In)(cust_review), customer_id: (0, typeorm_2.IsNull)() }
            });
            const providerReview = await this.RatingModel.find({
                where: { order_id: (0, typeorm_2.In)(cust_review), provider_id: (0, typeorm_2.IsNull)() }
            });
            const productDetails = await this.ProductModel.find({
                where: { id: (0, typeorm_2.In)(productIds) },
            });
            const productRequests = await this.ProductRequestModel.find({
                where: {
                    user_id: (0, typeorm_2.In)(providerIds),
                    product_id: (0, typeorm_2.In)(productIds),
                },
            });
            let providerRatings = [];
            if (providerIds.length > 0) {
                providerRatings = await this.RatingModel.createQueryBuilder('rating')
                    .select('rating.provider_id', 'provider_id')
                    .addSelect('AVG(rating.rating)', 'averageRating')
                    .addSelect('COUNT(rating.id)', 'totalRatingCount')
                    .where('rating.provider_id IN (:...providerIds)', { providerIds })
                    .groupBy('rating.provider_id')
                    .getRawMany();
            }
            else {
                providerRatings = [];
            }
            let customerRatings = [];
            if (customerIds.length > 0) {
                customerRatings = await this.RatingModel.createQueryBuilder('rating')
                    .select('rating.customer_id', 'customer_id')
                    .addSelect('AVG(rating.rating)', 'averageRating')
                    .addSelect('COUNT(rating.id)', 'totalRatingCount')
                    .where('rating.customer_id IN (:...customerIds)', { customerIds })
                    .groupBy('rating.customer_id')
                    .getRawMany();
            }
            else {
                customerRatings = [];
            }
            const paginatedData = common_util_1.default.getPagingData({ count, rows: pages }, page, limit);
            const shapefilePath = path.join(__dirname, '../../../../src/common/YE_osm_roads_lines_20230523.shp');
            console.log(__dirname, "__dirname");
            console.log(shapefilePath, "shapefilePath");
            const roads = await this.loadRoadData(shapefilePath);
            const graph = this.buildGraph(roads);
            const orderWithProviderData = await Promise.all(paginatedData.data.map(async (order) => {
                const provider = providers.find((p) => p.id === order.provider_id);
                const product = productDetails.find((p) => p.id === order.product_id);
                const addressDetails = address_id.find((p) => p.id === order.address_id);
                const providerAddress = providers_address.find((p) => p.user_id === order.provider_id);
                const customer_review = customerReview.find((p) => p.order_id === order.id);
                const provider_review = providerReview.find((p) => p.order_id === order.id);
                const productRequest = productRequests.find((pr) => pr.user_id === order.provider_id && pr.product_id === order.product_id);
                const providerRating = providerRatings.find((rating) => rating.provider_id === order.provider_id);
                const customersRating = customerRatings.find((rating) => (rating === null || rating === void 0 ? void 0 : rating.customer_id) === order.user_id);
                const formatRating = (rating) => {
                    if (rating === null || isNaN(rating))
                        return null;
                    const rounded = Math.round(rating * 2) / 2;
                    return rounded;
                };
                const formattedCustomerAverageRating = formatRating((customersRating === null || customersRating === void 0 ? void 0 : customersRating.averageRating) || null);
                const formattedProviderAverageRating = formatRating((providerRating === null || providerRating === void 0 ? void 0 : providerRating.averageRating) || null);
                const { distance, duration } = this.calculateRoute(graph, { lat: addressDetails.latitude, lon: addressDetails.longitude }, { lat: parseFloat(providerAddress.latitude), lon: parseFloat(providerAddress.longitude) });
                const formattedDistance = this.formatDistance(distance);
                const formattedDuration = this.formatDuration(duration);
                return Object.assign(Object.assign({}, order), { providerDetails: provider || null, productDetails: product || null, productChargeDetails: productRequest || null, addressDetails: addressDetails || null, platform_charge: setting.value, cancel_charge: settingcancel.value, provider_review_data: {
                        customer_review: (provider_review === null || provider_review === void 0 ? void 0 : provider_review.review) || null,
                        rating: (provider_review === null || provider_review === void 0 ? void 0 : provider_review.rating) || null,
                        averageRating: formattedCustomerAverageRating || null,
                        totalReview: (providerRating === null || providerRating === void 0 ? void 0 : providerRating.totalRatingCount) || 0,
                    }, customer_review_data: {
                        provider_review: (customer_review === null || customer_review === void 0 ? void 0 : customer_review.review) || null,
                        rating: (customer_review === null || customer_review === void 0 ? void 0 : customer_review.rating) || null,
                        averageRating: formattedProviderAverageRating || null,
                        totalReview: (customersRating === null || customersRating === void 0 ? void 0 : customersRating.totalRatingCount) || 0,
                    }, timing: {
                        distance: {
                            value: distance / 1000,
                            formatted: formattedDistance,
                        },
                        travelTime: {
                            value: Math.round(duration / 60),
                            formatted: formattedDuration,
                        },
                    } });
            }));
            const filteredOrders = orderWithProviderData.filter((order) => {
                var _a, _b, _c, _d, _e, _f;
                if (search) {
                    const productNameMatch = (_b = (_a = order.productDetails) === null || _a === void 0 ? void 0 : _a.product_name) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(search.toLowerCase());
                    const providerNameMatch = (_d = (_c = order.providerDetails) === null || _c === void 0 ? void 0 : _c.name) === null || _d === void 0 ? void 0 : _d.toLowerCase().includes(search.toLowerCase());
                    const status = (_e = order === null || order === void 0 ? void 0 : order.status) === null || _e === void 0 ? void 0 : _e.toLowerCase().includes(search.toLowerCase());
                    const order_id = (_f = order === null || order === void 0 ? void 0 : order.order_id) === null || _f === void 0 ? void 0 : _f.toLowerCase().includes(search.toLowerCase());
                    return productNameMatch || providerNameMatch || status || order_id;
                }
                return true;
            });
            return {
                status: true,
                message: "Order List has been retrieved successfully!",
                data: {
                    totalItems: count,
                    data: filteredOrders,
                    totalPages: Math.ceil(count / pageSize),
                    currentPage: Number(page),
                },
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getArrivalOrderList(page = 1, pageSize = 10, search = '', user_id, productNameSearch = '') {
        try {
            const { limit, offset } = common_util_1.default.getPagination(page, pageSize);
            const whereCondition = { user_id, status: 'ACCEPTED' };
            const [pages, count] = await this.OrderModel.findAndCount({
                where: whereCondition,
                skip: offset,
                take: limit,
                order: { createdAt: 'DESC' },
            });
            const setting = await this.Setting.findOne({ where: { key: "platform_charge_per_order" } });
            const settingcancel = await this.Setting.findOne({ where: { key: "customer_cancel_fees" } });
            const providerIds = pages.map((order) => order.provider_id);
            const customerIds = pages.map((order) => order.user_id);
            const productIds = pages.map((order) => order.product_id);
            const address = pages.map((order) => order.address_id);
            const cust_review = pages.map((order) => order.id);
            const providers = await this.UserRequestModel.find({
                where: { id: (0, typeorm_2.In)(providerIds) },
            });
            const providers_address = await this.UserLocationModel.find({
                where: { user_id: (0, typeorm_2.In)(providerIds) },
            });
            const address_id = await this.UserLocationModel.find({
                where: { id: (0, typeorm_2.In)(address) },
            });
            const customerReview = await this.RatingModel.find({
                where: { order_id: (0, typeorm_2.In)(cust_review), customer_id: (0, typeorm_2.IsNull)() }
            });
            const providerReview = await this.RatingModel.find({
                where: { order_id: (0, typeorm_2.In)(cust_review), provider_id: (0, typeorm_2.IsNull)() }
            });
            const productDetails = await this.ProductModel.find({
                where: { id: (0, typeorm_2.In)(productIds) },
            });
            const productRequests = await this.ProductRequestModel.find({
                where: {
                    user_id: (0, typeorm_2.In)(providerIds),
                    product_id: (0, typeorm_2.In)(productIds),
                },
            });
            let providerRatings = [];
            if (providerIds.length > 0) {
                providerRatings = await this.RatingModel.createQueryBuilder('rating')
                    .select('rating.provider_id', 'provider_id')
                    .addSelect('AVG(rating.rating)', 'averageRating')
                    .addSelect('COUNT(rating.id)', 'totalRatingCount')
                    .where('rating.provider_id IN (:...providerIds)', { providerIds })
                    .groupBy('rating.provider_id')
                    .getRawMany();
            }
            else {
                providerRatings = [];
            }
            let customerRatings = [];
            if (customerIds.length > 0) {
                customerRatings = await this.RatingModel.createQueryBuilder('rating')
                    .select('rating.customer_id', 'customer_id')
                    .addSelect('AVG(rating.rating)', 'averageRating')
                    .addSelect('COUNT(rating.id)', 'totalRatingCount')
                    .where('rating.customer_id IN (:...customerIds)', { customerIds })
                    .groupBy('rating.customer_id')
                    .getRawMany();
            }
            else {
                customerRatings = [];
            }
            const paginatedData = common_util_1.default.getPagingData({ count, rows: pages }, page, limit);
            const shapefilePath = path.join(__dirname, '../../../../src/common/YE_osm_roads_lines_20230523.shp');
            console.log(__dirname, "__dirname");
            console.log(shapefilePath, "shapefilePath");
            const roads = await this.loadRoadData(shapefilePath);
            const graph = this.buildGraph(roads);
            const orderWithProviderData = await Promise.all(paginatedData.data.map(async (order) => {
                const provider = providers.find((p) => p.id === order.provider_id);
                const product = productDetails.find((p) => p.id === order.product_id);
                const addressDetails = address_id.find((p) => p.id === order.address_id);
                const providerAddress = providers_address.find((p) => p.user_id === order.provider_id);
                const customer_review = customerReview.find((p) => p.order_id === order.id);
                const provider_review = providerReview.find((p) => p.order_id === order.id);
                const productRequest = productRequests.find((pr) => pr.user_id === order.provider_id && pr.product_id === order.product_id);
                const providerRating = providerRatings.find((rating) => rating.provider_id === order.provider_id);
                const customersRating = customerRatings.find((rating) => (rating === null || rating === void 0 ? void 0 : rating.customer_id) === order.user_id);
                const formatRating = (rating) => {
                    if (rating === null || isNaN(rating))
                        return null;
                    const rounded = Math.round(rating * 2) / 2;
                    return rounded;
                };
                const formattedCustomerAverageRating = formatRating((customersRating === null || customersRating === void 0 ? void 0 : customersRating.averageRating) || null);
                const formattedProviderAverageRating = formatRating((providerRating === null || providerRating === void 0 ? void 0 : providerRating.averageRating) || null);
                const { distance, duration } = this.calculateRoute(graph, { lat: addressDetails.latitude, lon: addressDetails.longitude }, { lat: parseFloat(providerAddress.latitude), lon: parseFloat(providerAddress.longitude) });
                const formattedDistance = this.formatDistance(distance);
                const formattedDuration = this.formatDuration(duration);
                return Object.assign(Object.assign({}, order), { providerDetails: provider || null, productDetails: product || null, productChargeDetails: productRequest || null, addressDetails: addressDetails || null, platform_charge: setting.value, cancel_charge: settingcancel.value, provider_review_data: {
                        customer_review: (provider_review === null || provider_review === void 0 ? void 0 : provider_review.review) || null,
                        rating: (provider_review === null || provider_review === void 0 ? void 0 : provider_review.rating) || null,
                        averageRating: formattedCustomerAverageRating || null,
                        totalReview: (providerRating === null || providerRating === void 0 ? void 0 : providerRating.totalRatingCount) || 0,
                    }, customer_review_data: {
                        provider_review: (customer_review === null || customer_review === void 0 ? void 0 : customer_review.review) || null,
                        rating: (customer_review === null || customer_review === void 0 ? void 0 : customer_review.rating) || null,
                        averageRating: formattedProviderAverageRating || null,
                        totalReview: (customersRating === null || customersRating === void 0 ? void 0 : customersRating.totalRatingCount) || 0,
                    }, timing: {
                        distance: {
                            value: distance / 1000,
                            formatted: formattedDistance,
                        },
                        travelTime: {
                            value: Math.round(duration / 60),
                            formatted: formattedDuration,
                        },
                    } });
            }));
            const filteredOrders = orderWithProviderData.filter((order) => {
                var _a, _b, _c, _d, _e, _f;
                if (search) {
                    const productNameMatch = (_b = (_a = order.productDetails) === null || _a === void 0 ? void 0 : _a.product_name) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(search.toLowerCase());
                    const providerNameMatch = (_d = (_c = order.providerDetails) === null || _c === void 0 ? void 0 : _c.name) === null || _d === void 0 ? void 0 : _d.toLowerCase().includes(search.toLowerCase());
                    const status = (_e = order === null || order === void 0 ? void 0 : order.status) === null || _e === void 0 ? void 0 : _e.toLowerCase().includes(search.toLowerCase());
                    const order_id = (_f = order === null || order === void 0 ? void 0 : order.order_id) === null || _f === void 0 ? void 0 : _f.toLowerCase().includes(search.toLowerCase());
                    return productNameMatch || providerNameMatch || status || order_id;
                }
                return true;
            });
            return {
                status: true,
                message: "Order List has been retrieved successfully!",
                data: {
                    totalItems: count,
                    data: filteredOrders,
                    totalPages: Math.ceil(count / pageSize),
                    currentPage: Number(page),
                },
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async updateData(id, updateData) {
        try {
            let response = await this.OrderModel.update(id, updateData);
            if (response[0] === 0) {
                throw new Error("No Product data was updated.");
            }
            return response;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getpayment(id) {
        try {
            const walletData = await this.Wallet_req.findOne({ where: { transaction_id: id } });
            3;
            if (!walletData) {
                throw new Error("No transactrion data was updated.");
            }
            return walletData;
        }
        catch (error) {
            throw new Error('Error retrieving wallet details: ' + error.message);
        }
    }
};
OrderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_schema_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(product_request_schema_1.ProductRequest)),
    __param(2, (0, typeorm_1.InjectRepository)(user_schema_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(user_location_schema_1.User_location)),
    __param(4, (0, typeorm_1.InjectRepository)(rating_schema_1.Rating)),
    __param(5, (0, typeorm_1.InjectRepository)(wishlist_schema_1.ProviderWishlist)),
    __param(6, (0, typeorm_1.InjectRepository)(order_schema_1.Order)),
    __param(7, (0, typeorm_1.InjectRepository)(wallet_req_schema_1.Wallet_req)),
    __param(8, (0, typeorm_1.InjectRepository)(setting_schema_1.Setting)),
    __param(9, (0, typeorm_1.InjectRepository)(notification_schema_1.Notification)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], OrderService);
exports.OrderService = OrderService;
//# sourceMappingURL=order_management.service.js.map