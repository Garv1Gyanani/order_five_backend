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
const common_messages_1 = require("../../../common/common-messages");
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
    async getOrderList(page = 1, pageSize = 10, search = '', status) {
        try {
            const { limit, offset } = common_util_1.default.getPagination(page, pageSize);
            let whereCondition = {};
            if (status && status.toLowerCase() !== 'all') {
                whereCondition['status'] = status.toUpperCase();
            }
            const [pages, count] = await this.OrderModel.findAndCount({
                where: whereCondition,
                skip: offset,
                take: limit,
                order: { createdAt: 'DESC' },
            });
            const customerIds = pages.map((order) => order.user_id);
            const providerIds = pages.map((order) => order.provider_id);
            const productIds = pages.map((order) => order.product_id);
            const providers = await this.UserRequestModel.find({
                where: { id: (0, typeorm_2.In)(providerIds) },
            });
            const customers = await this.UserRequestModel.find({
                where: { id: (0, typeorm_2.In)(customerIds) },
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
            const paginatedData = common_util_1.default.getPagingData({ count, rows: pages }, page, limit);
            const orderWithProviderData = paginatedData.data
                .map((order) => {
                const provider = providers.find((p) => p.id === order.provider_id);
                const customer = customers.find((p) => p.id === order.user_id);
                const product = productDetails.find((p) => p.id === order.product_id);
                const productRequest = productRequests.find((pr) => pr.user_id === order.provider_id && pr.product_id === order.product_id);
                return Object.assign(Object.assign({}, order), { customerDetails: customer || null, providerDetails: provider || null, productDetails: product || null, productChargeDetails: productRequest || null });
            })
                .filter((order) => {
                var _a, _b, _c, _d, _e, _f, _g;
                if (search) {
                    const productNameMatch = (_b = (_a = order.productDetails) === null || _a === void 0 ? void 0 : _a.product_name) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(search.toLowerCase());
                    const providerNameMatch = (_d = (_c = order.providerDetails) === null || _c === void 0 ? void 0 : _c.name) === null || _d === void 0 ? void 0 : _d.toLowerCase().includes(search.toLowerCase());
                    const order_id = (_e = order.order_id) === null || _e === void 0 ? void 0 : _e.toLowerCase().includes(search.toLowerCase());
                    const customername = (_g = (_f = order.customerDetails) === null || _f === void 0 ? void 0 : _f.name) === null || _g === void 0 ? void 0 : _g.toLowerCase().includes(search.toLowerCase());
                    return productNameMatch || providerNameMatch || customername || order_id;
                }
                return true;
            });
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
    async getOrderListById(page = 1, pageSize = 10, id) {
        try {
            const { limit, offset } = common_util_1.default.getPagination(page, pageSize);
            const [pages, count] = await this.OrderModel.findAndCount({
                where: { provider_id: id },
                skip: offset,
                take: limit,
                order: { createdAt: 'DESC' },
            });
            const customerIds = pages.map((order) => order.user_id);
            const providerIds = pages.map((order) => order.provider_id);
            const productIds = pages.map((order) => order.product_id);
            const address_id = pages.map((order) => order.address_id);
            const orderIDs = pages.map((order) => order.id);
            const providers = await this.UserRequestModel.find({
                where: { id: (0, typeorm_2.In)(providerIds) },
            });
            const customers = await this.UserRequestModel.find({
                where: { id: (0, typeorm_2.In)(customerIds) },
            });
            const address = await this.UserLocationModel.find({
                where: { id: (0, typeorm_2.In)(address_id) },
            });
            const customersrating = await this.RatingModel.find({
                where: { order_id: (0, typeorm_2.In)(orderIDs), customer_id: (0, typeorm_2.In)(customerIds), provider_id: (0, typeorm_2.IsNull)() },
            });
            const providersrating = await this.RatingModel.find({
                where: { order_id: (0, typeorm_2.In)(orderIDs), provider_id: (0, typeorm_2.In)(providerIds), customer_id: (0, typeorm_2.IsNull)() },
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
            const paginatedData = common_util_1.default.getPagingData({ count, rows: pages }, page, limit);
            const orderWithProviderData = paginatedData.data
                .map((order) => {
                const provider = providers.find((p) => p.id === order.provider_id);
                const customer = customers.find((p) => p.id === order.user_id);
                const product = productDetails.find((p) => p.id === order.product_id);
                const addressDetails = address.find((p) => p.id === order.address_id);
                const customerRating = customersrating.find((p) => p.order_id === order.id);
                const ProviderRating = providersrating.find((p) => p.order_id === order.id);
                const productRequest = productRequests.find((pr) => pr.user_id === order.provider_id && pr.product_id === order.product_id);
                return Object.assign(Object.assign({}, order), { customerDetails: customer || null, providerDetails: provider || null, productDetails: product || null, productChargeDetails: productRequest || null, customerRating: (customerRating === null || customerRating === void 0 ? void 0 : customerRating.rating) || null, ProviderRating: (ProviderRating === null || ProviderRating === void 0 ? void 0 : ProviderRating.rating) || null, addressDetails: addressDetails || null });
            });
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
    async OrderListById(id) {
        try {
            const pages = await this.OrderModel.find({
                where: { id },
                order: { createdAt: 'DESC' },
            });
            if (pages.length === 0) {
                return {
                    status: false,
                    message: "No order found with this ID.",
                    data: null,
                };
            }
            const order = pages[0];
            const userAddress = await this.UserLocationModel.findOne({
                where: { id: order.address_id },
            });
            if (!userAddress) {
                throw new Error('User address not found');
            }
            const providerAddress = await this.UserLocationModel.findOne({
                where: { user_id: order.provider_id },
            });
            if (!providerAddress) {
                throw new Error('Provider address not found');
            }
            const shapefilePath = path.join(__dirname, '../../../../src/common/YE_osm_roads_lines_20230523.shp');
            console.log(__dirname, "__dirname");
            console.log(shapefilePath, "shapefilePath");
            const roads = await this.loadRoadData(shapefilePath);
            const graph = this.buildGraph(roads);
            const { distance, duration } = this.calculateRoute(graph, { lat: userAddress.latitude, lon: userAddress.longitude }, { lat: parseFloat(providerAddress.latitude), lon: parseFloat(providerAddress.longitude) });
            const formattedDistance = this.formatDistance(distance);
            const formattedDuration = this.formatDuration(duration);
            const customerIds = [order.user_id];
            const providerIds = [order.provider_id];
            const productIds = [order.product_id];
            const address_id = [order.address_id];
            const orderIds = [order.id];
            const providers = await this.UserRequestModel.find({
                where: { id: (0, typeorm_2.In)(providerIds) },
            });
            const setting = await this.Setting.findOne({ where: { key: "platform_charge_per_order" } });
            const customers = await this.UserRequestModel.find({
                where: { id: (0, typeorm_2.In)(customerIds) },
            });
            const address = await this.UserLocationModel.find({
                where: { id: (0, typeorm_2.In)(address_id) },
            });
            const customersrating = await this.RatingModel.find({
                where: { order_id: (0, typeorm_2.In)(orderIds), customer_id: (0, typeorm_2.In)(customerIds), provider_id: (0, typeorm_2.IsNull)() },
            });
            const providersrating = await this.RatingModel.find({
                where: { order_id: (0, typeorm_2.In)(orderIds), provider_id: (0, typeorm_2.In)(providerIds), customer_id: (0, typeorm_2.IsNull)() },
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
            const provider = providers.find((p) => p.id === order.provider_id);
            const customer = customers.find((p) => p.id === order.user_id);
            const product = productDetails.find((p) => p.id === order.product_id);
            const addressDetails = address.find((p) => p.id === order.address_id);
            const customerRating = customersrating.find((p) => p.order_id === order.id);
            const ProviderRating = providersrating.find((p) => p.order_id === order.id);
            const productRequest = productRequests.find((pr) => pr.user_id === order.provider_id && pr.product_id === order.product_id);
            return {
                status: true,
                message: "Order has been retrieved successfully!",
                data: Object.assign(Object.assign({}, order), { customerDetails: customer || null, providerDetails: provider || null, productDetails: product || null, productChargeDetails: productRequest || null, customerRating: (customerRating === null || customerRating === void 0 ? void 0 : customerRating.rating) || null, ProviderRating: (ProviderRating === null || ProviderRating === void 0 ? void 0 : ProviderRating.rating) || null, addressDetails: addressDetails || null, platform_charge: setting.value || null, distance: {
                        value: distance / 1000,
                        formatted: formattedDistance,
                    }, travelTime: {
                        value: Math.round(duration / 60),
                        formatted: formattedDuration,
                    } }),
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getcstOrderListById(page = 1, pageSize = 10, id) {
        try {
            const { limit, offset } = common_util_1.default.getPagination(page, pageSize);
            const [pages, count] = await this.OrderModel.findAndCount({
                where: { user_id: id },
                skip: offset,
                take: limit,
                order: { createdAt: 'DESC' },
            });
            const customerIds = pages.map((order) => order.user_id);
            const orderIds = pages.map((order) => order.id);
            const providerIds = pages.map((order) => order.provider_id);
            const productIds = pages.map((order) => order.product_id);
            const address_id = pages.map((order) => order.address_id);
            const providers = await this.UserRequestModel.find({
                where: { id: (0, typeorm_2.In)(providerIds) },
            });
            const customers = await this.UserRequestModel.find({
                where: { id: (0, typeorm_2.In)(customerIds) },
            });
            const address = await this.UserLocationModel.find({
                where: { id: (0, typeorm_2.In)(address_id) },
            });
            const customersrating = await this.RatingModel.find({
                where: { order_id: (0, typeorm_2.In)(orderIds), customer_id: (0, typeorm_2.In)(customerIds), provider_id: (0, typeorm_2.IsNull)() },
            });
            const providersrating = await this.RatingModel.find({
                where: { order_id: (0, typeorm_2.In)(orderIds), provider_id: (0, typeorm_2.In)(providerIds), customer_id: (0, typeorm_2.IsNull)() },
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
            const paginatedData = common_util_1.default.getPagingData({ count, rows: pages }, page, limit);
            const orderWithProviderData = paginatedData.data
                .map((order) => {
                const provider = providers.find((p) => p.id === order.provider_id);
                const customer = customers.find((p) => p.id === order.user_id);
                const product = productDetails.find((p) => p.id === order.product_id);
                const addressDetails = address.find((p) => p.id === order.address_id);
                const customerRating = customersrating.find((p) => p.order_id === order.id);
                const ProviderRating = providersrating.find((p) => p.order_id === order.id);
                const productRequest = productRequests.find((pr) => pr.user_id === order.provider_id && pr.product_id === order.product_id);
                return Object.assign(Object.assign({}, order), { customerDetails: customer || null, providerDetails: provider || null, productDetails: product || null, productChargeDetails: productRequest || null, customerRating: (customerRating === null || customerRating === void 0 ? void 0 : customerRating.rating) || null, ProviderRating: (ProviderRating === null || ProviderRating === void 0 ? void 0 : ProviderRating.rating) || null, addressDetails: addressDetails || null });
            });
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
    async bulkDeletedata(ids) {
        try {
            const categories = await this.OrderModel.find({ where: { id: (0, typeorm_2.In)(ids) } });
            if (categories.length === 0) {
                throw new Error(common_messages_1.CommonMessages.notFound('order'));
            }
            const result = await this.OrderModel.softDelete(ids);
            return result.affected || 0;
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