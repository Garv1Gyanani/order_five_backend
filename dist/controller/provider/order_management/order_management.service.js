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
let OrderService = class OrderService {
    constructor(ProductModel, ProductRequestModel, UserRequestModel, UserLocationModel, RatingModel, WishlistModel, OrderModel, Wallet_req, Setting) {
        this.ProductModel = ProductModel;
        this.ProductRequestModel = ProductRequestModel;
        this.UserRequestModel = UserRequestModel;
        this.UserLocationModel = UserLocationModel;
        this.RatingModel = RatingModel;
        this.WishlistModel = WishlistModel;
        this.OrderModel = OrderModel;
        this.Wallet_req = Wallet_req;
        this.Setting = Setting;
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
    async getOrderList(page = 1, pageSize = 10, search = '', user_id, status = 'UPCOMING') {
        try {
            const { limit, offset } = common_util_1.default.getPagination(page, pageSize);
            const whereCondition = { provider_id: user_id };
            if (search) {
                whereCondition['order_id'] = { $ilike: `%${search}%` };
            }
            if (status) {
                whereCondition['status'] = status.toUpperCase();
            }
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
            const customerData = pages.map((order) => order.user_id);
            const providerReview = await this.RatingModel.find({
                where: { order_id: (0, typeorm_2.In)(cust_review), provider_id: (0, typeorm_2.IsNull)() }
            });
            const customer_review = await this.RatingModel.find({
                where: { order_id: (0, typeorm_2.In)(cust_review), customer_id: (0, typeorm_2.IsNull)() }
            });
            const providers = await this.UserRequestModel.find({
                where: { id: (0, typeorm_2.In)(providerIds) },
            });
            const address_id = await this.UserLocationModel.find({
                where: { id: (0, typeorm_2.In)(address) },
            });
            const productDetails = await this.ProductModel.find({
                where: { id: (0, typeorm_2.In)(productIds) },
            });
            const customerDetails = await this.UserRequestModel.find({
                where: { id: (0, typeorm_2.In)(customerData) },
            });
            const productRequests = await this.ProductRequestModel.find({
                where: {
                    user_id: (0, typeorm_2.In)(providerIds),
                    product_id: (0, typeorm_2.In)(productIds),
                },
            });
            const providers_address = await this.UserLocationModel.find({
                where: { user_id: (0, typeorm_2.In)(providerIds) },
            });
            const customerRatings = providerIds.length > 0
                ? await this.RatingModel.createQueryBuilder('rating')
                    .select('rating.provider_id', 'provider_id')
                    .addSelect('AVG(rating.rating)', 'averageRating')
                    .addSelect('COUNT(rating.id)', 'totalRatingCount')
                    .where('rating.provider_id IN (:...providerIds)', { providerIds })
                    .groupBy('rating.provider_id')
                    .getRawMany()
                : [];
            const providerRatings = customerIds.length > 0
                ? await this.RatingModel.createQueryBuilder('rating')
                    .select('rating.customer_id', 'customer_id')
                    .addSelect('AVG(rating.rating)', 'averageRating')
                    .addSelect('COUNT(rating.id)', 'totalRatingCount')
                    .where('rating.customer_id IN (:...customerIds)', { customerIds })
                    .groupBy('rating.customer_id')
                    .getRawMany()
                : [];
            const paginatedData = common_util_1.default.getPagingData({ count, rows: pages }, page, limit);
            const shapefilePath = path.join(__dirname, '../../../../src/common/YE_osm_roads_lines_20230523.shp');
            console.log(__dirname, "__dirname");
            console.log(shapefilePath, "shapefilePath");
            const roads = await this.loadRoadData(shapefilePath);
            const graph = this.buildGraph(roads);
            const orderWithProviderData = await Promise.all(paginatedData.data.map(async (order) => {
                const provider = providers.find((p) => p.id === order.provider_id);
                const product = productDetails.find((p) => p.id === order.product_id);
                const customer = customerDetails.find((p) => p.id === order.user_id);
                const addressDetails = address_id.find((p) => p.id === order.address_id);
                const provider_review = providerReview.find((p) => p.order_id === order.id);
                const customerReview = customer_review.find((p) => p.order_id === order.id);
                const providerAddress = providers_address.find((p) => p.user_id === order.provider_id);
                const productRequest = productRequests.find((pr) => pr.user_id === order.provider_id && pr.product_id === order.product_id);
                const customerRating = customerRatings.find((rating) => rating.provider_id === order.provider_id);
                const providersRatings = providerRatings.find((rating) => rating.customer_id === order.user_id);
                const formatRating = (rating) => {
                    if (rating === null || isNaN(rating))
                        return null;
                    const rounded = Math.round(rating * 2) / 2;
                    return rounded;
                };
                const formattedCustomerAverageRating = formatRating((customerRating === null || customerRating === void 0 ? void 0 : customerRating.averageRating) || null);
                const formattedProviderAverageRating = formatRating((providersRatings === null || providersRatings === void 0 ? void 0 : providersRatings.averageRating) || null);
                const { distance, duration } = this.calculateRoute(graph, { lat: addressDetails.latitude, lon: addressDetails.longitude }, { lat: parseFloat(providerAddress.latitude), lon: parseFloat(providerAddress.longitude) });
                const formattedDistance = this.formatDistance(distance);
                const formattedDuration = this.formatDuration(duration);
                return Object.assign(Object.assign({}, order), { providerDetails: provider || null, productDetails: product || null, productChargeDetails: productRequest || null, addressDetails: addressDetails || null, customer: customer || null, platform_charge: setting.value, cancel_charge: settingcancel.value, customer_review_data: {
                        provider_review: (provider_review === null || provider_review === void 0 ? void 0 : provider_review.review) || null,
                        provider_rating: (provider_review === null || provider_review === void 0 ? void 0 : provider_review.rating) || null,
                        averageRating: formattedProviderAverageRating || null,
                        totalReview: (providersRatings === null || providersRatings === void 0 ? void 0 : providersRatings.totalRatingCount) || 0,
                    }, provider_review_data: {
                        customer_review: (customerReview === null || customerReview === void 0 ? void 0 : customerReview.review) || null,
                        customer_rating: (customerReview === null || customerReview === void 0 ? void 0 : customerReview.rating) || null,
                        averageRating: formattedCustomerAverageRating || null,
                        totalReview: (customerRating === null || customerRating === void 0 ? void 0 : customerRating.totalRatingCount) || 0,
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
            return {
                status: true,
                message: "Order List has been retrieved successfully!",
                data: {
                    totalItems: count,
                    data: orderWithProviderData,
                    totalPages: Math.ceil(count / pageSize),
                    currentPage: Number(page),
                },
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getOrderCount(user_id) {
        try {
            const activeOrderCount = await this.OrderModel.count({
                where: {
                    provider_id: user_id,
                    status: (0, typeorm_2.In)(['UPCOMING', 'ACCEPTED']),
                },
            });
            const completedOrderCount = await this.OrderModel.count({
                where: {
                    provider_id: user_id,
                    status: 'DELIVERED',
                },
            });
            return {
                status: true,
                message: 'Order counts retrieved successfully',
                data: {
                    activeOrders: activeOrderCount,
                    completedOrders: completedOrderCount,
                },
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getRecentOrder(user_id) {
        try {
            const whereCondition = { provider_id: user_id, status: 'UPCOMING' };
            const orders = await this.OrderModel.find({
                where: whereCondition,
                order: { createdAt: 'DESC' },
                take: 5
            });
            const setting = await this.Setting.findOne({ where: { key: "platform_charge_per_order" } });
            const settingcancel = await this.Setting.findOne({ where: { key: "customer_cancel_fees" } });
            const providerIds = orders.map((order) => order.provider_id);
            const customerIds = orders.map((order) => order.user_id);
            const productIds = orders.map((order) => order.product_id);
            const address = orders.map((order) => order.address_id);
            const cust_review = orders.map((order) => order.id);
            const customerData = orders.map((order) => order.user_id);
            const providerReview = await this.RatingModel.find({
                where: { order_id: (0, typeorm_2.In)(cust_review), provider_id: (0, typeorm_2.IsNull)() },
            });
            const customer_review = await this.RatingModel.find({
                where: { order_id: (0, typeorm_2.In)(cust_review), customer_id: (0, typeorm_2.IsNull)() },
            });
            const providers = await this.UserRequestModel.find({
                where: { id: (0, typeorm_2.In)(providerIds) },
            });
            const address_id = await this.UserLocationModel.find({
                where: { id: (0, typeorm_2.In)(address) },
            });
            const productDetails = await this.ProductModel.find({
                where: { id: (0, typeorm_2.In)(productIds) },
            });
            const customerDetails = await this.UserRequestModel.find({
                where: { id: (0, typeorm_2.In)(customerData) },
            });
            const productRequests = await this.ProductRequestModel.find({
                where: {
                    user_id: (0, typeorm_2.In)(providerIds),
                    product_id: (0, typeorm_2.In)(productIds),
                },
            });
            const providers_address = await this.UserLocationModel.find({
                where: { user_id: (0, typeorm_2.In)(providerIds) },
            });
            const customerRatings = providerIds.length > 0
                ? await this.RatingModel.createQueryBuilder('rating')
                    .select('rating.provider_id', 'provider_id')
                    .addSelect('AVG(rating.rating)', 'averageRating')
                    .addSelect('COUNT(rating.id)', 'totalRatingCount')
                    .where('rating.provider_id IN (:...providerIds)', { providerIds })
                    .groupBy('rating.provider_id')
                    .getRawMany()
                : [];
            const providerRatings = customerIds.length > 0
                ? await this.RatingModel.createQueryBuilder('rating')
                    .select('rating.customer_id', 'customer_id')
                    .addSelect('AVG(rating.rating)', 'averageRating')
                    .addSelect('COUNT(rating.id)', 'totalRatingCount')
                    .where('rating.customer_id IN (:...customerIds)', { customerIds })
                    .groupBy('rating.customer_id')
                    .getRawMany()
                : [];
            const shapefilePath = path.join(__dirname, '../../../../src/common/YE_osm_roads_lines_20230523.shp');
            console.log(__dirname, "__dirname");
            console.log(shapefilePath, "shapefilePath");
            const roads = await this.loadRoadData(shapefilePath);
            const graph = this.buildGraph(roads);
            const orderWithProviderData = await Promise.all(orders.map(async (order) => {
                const provider = providers.find((p) => p.id === order.provider_id);
                const product = productDetails.find((p) => p.id === order.product_id);
                const customer = customerDetails.find((p) => p.id === order.user_id);
                const addressDetails = address_id.find((p) => p.id === order.address_id);
                const provider_review = providerReview.find((p) => p.order_id === order.id);
                const customerReview = customer_review.find((p) => p.order_id === order.id);
                const providerAddress = providers_address.find((p) => p.user_id === order.provider_id);
                const productRequest = productRequests.find((pr) => pr.user_id === order.provider_id && pr.product_id === order.product_id);
                const customerRating = customerRatings.find((rating) => rating.provider_id === order.provider_id);
                const providersRatings = providerRatings.find((rating) => rating.customer_id === order.user_id);
                const formatRating = (rating) => {
                    if (rating === null || isNaN(rating))
                        return null;
                    const rounded = Math.round(rating * 2) / 2;
                    return rounded;
                };
                const formattedCustomerAverageRating = formatRating((customerRating === null || customerRating === void 0 ? void 0 : customerRating.averageRating) || null);
                const formattedProviderAverageRating = formatRating((providersRatings === null || providersRatings === void 0 ? void 0 : providersRatings.averageRating) || null);
                const { distance, duration } = this.calculateRoute(graph, { lat: addressDetails.latitude, lon: addressDetails.longitude }, { lat: parseFloat(providerAddress.latitude), lon: parseFloat(providerAddress.longitude) });
                const formattedDistance = this.formatDistance(distance);
                const formattedDuration = this.formatDuration(duration);
                return Object.assign(Object.assign({}, order), { providerDetails: provider || null, productDetails: product || null, productChargeDetails: productRequest || null, addressDetails: addressDetails || null, customer: customer || null, platform_charge: setting.value, cancel_charge: settingcancel.value, customer_review_data: {
                        provider_review: (provider_review === null || provider_review === void 0 ? void 0 : provider_review.review) || null,
                        provider_rating: (provider_review === null || provider_review === void 0 ? void 0 : provider_review.rating) || null,
                        averageRating: formattedProviderAverageRating || null,
                        totalReview: (providersRatings === null || providersRatings === void 0 ? void 0 : providersRatings.totalRatingCount) || 0,
                    }, provider_review_data: {
                        customer_review: (customerReview === null || customerReview === void 0 ? void 0 : customerReview.review) || null,
                        customer_rating: (customerReview === null || customerReview === void 0 ? void 0 : customerReview.rating) || null,
                        averageRating: formattedCustomerAverageRating || null,
                        totalReview: (customerRating === null || customerRating === void 0 ? void 0 : customerRating.totalRatingCount) || 0,
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
            return {
                status: true,
                message: "Order List has been retrieved successfully!",
                data: orderWithProviderData,
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getpayment(id) {
        try {
            const walletData = await this.Wallet_req.findOne({ where: { transaction_id: id } });
            if (!walletData) {
                throw new Error("No transactrion data was updated.");
            }
            return {
                status: true,
                message: 'Transaction data get success',
                data: walletData
            };
        }
        catch (error) {
            throw new Error('Error retrieving wallet details: ' + error.message);
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
    __metadata("design:paramtypes", [typeorm_2.Repository,
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