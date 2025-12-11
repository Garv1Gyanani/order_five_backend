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
exports.OrderController = void 0;
const common_1 = require("@nestjs/common");
const order_management_service_1 = require("./order_management.service");
const common_messages_1 = require("../../../common/common-messages");
const user_guard_1 = require("../../../authGuard/user.guard");
const order_schema_1 = require("../../../schema/order.schema");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const user_location_schema_1 = require("../../../schema/user_location.schema");
const user_schema_1 = require("../../../schema/user.schema");
const wallet_req_schema_1 = require("../../../schema/wallet_req.schema");
const setting_schema_1 = require("../../../schema/setting.schema");
const common_util_1 = require("../../../common/common.util");
const shapefile = require("shapefile");
const path = require("path");
const admin = require("firebase-admin");
const dotenv = require("dotenv");
const notification_schema_1 = require("../../../schema/notification.schema");
dotenv.config();
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CREDENTIALS || '{}')),
    });
}
let OrderController = class OrderController {
    constructor(OrderService, Order, User_location, User, Wallet_req, Setting, NotificationModel) {
        this.OrderService = OrderService;
        this.Order = Order;
        this.User_location = User_location;
        this.User = User;
        this.Wallet_req = Wallet_req;
        this.Setting = Setting;
        this.NotificationModel = NotificationModel;
    }
    async findNearbyProviders(body, req) {
        const { product_id, latitude, longitude, filter = 10, rating = '3-4' } = body;
        console.log(body, "bodyyy");
        const { page = 1, size = 10, s } = req.query;
        const userLogid = req.user.id;
        if (!product_id || !latitude || !longitude) {
            throw new Error('Missing required parameters: product_id, latitude, or longitude');
        }
        return await this.OrderService.findNearbyProviders(product_id, parseFloat(latitude), parseFloat(longitude), filter, rating, userLogid, s, parseInt(page, 10), parseInt(size, 10));
    }
    async orderCreate(createDto, req) {
        try {
            const user_id = req.user.id;
            createDto.user_id = user_id;
            if (!createDto.total_price) {
                return { status: false, message: 'Total price is required' };
            }
            const data = await this.OrderService.orderCreate(createDto);
            return { status: true, message: 'Order has been created successfully', data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async createCashWalletData(createDto, req) {
        try {
            let user_id = req.user.id;
            createDto.user_id = user_id;
            const data = await this.OrderService.createCashWalletData(createDto);
            return { status: true, message: common_messages_1.CommonMessages.created_data("Wallet Request"), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getOrderList(req) {
        try {
            const user_id = req.user.id;
            const { page = 1, size = 10, s = '' } = req.query;
            const data = await this.OrderService.getOrderList(page, size, s, user_id);
            return data;
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getArrivalOrderList(req) {
        try {
            const user_id = req.user.id;
            const { page = 1, size = 10, s = '' } = req.query;
            const data = await this.OrderService.getArrivalOrderList(page, size, s, user_id);
            return data;
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async orderCancle(req, id, updateData) {
        try {
            const user_id = req.user.id;
            const user = await this.User.findOne({ where: { id: user_id } });
            if (!user) {
                return { status: false, message: common_messages_1.CommonMessages.notFound('User') };
            }
            const cancllation = await this.Setting.findOne({ where: { key: 'customer_cancel_fees' } });
            const cancel_charge = Number(cancllation.value);
            if (user.wallet_balance < cancel_charge) {
                return { status: false, message: 'Insufficient wallet balance to cancel the order.' };
            }
            const order = await this.Order.findOne({ where: { id } });
            if (!order) {
                return { status: false, message: common_messages_1.CommonMessages.notFound('Order') };
            }
            const realUser = await this.User.findOne({ where: { id: order.provider_id } });
            const updatedWalletBalance = user.wallet_balance - cancel_charge;
            await this.User.update({ id: user_id }, { wallet_balance: updatedWalletBalance });
            const transaction_id = common_util_1.default.createTransactionId();
            await this.Wallet_req.create({
                user_id: user.id,
                user_type: 'Customer',
                amount_status: 'Credit',
                wallet_type: 'Online',
                transaction_id,
                currency: 'OMR',
                amount: cancel_charge,
                available_amount: updatedWalletBalance,
                remark: `Order cancellation for Order ID: ${id}`,
                status: 'Approved',
                date: new Date(),
            });
            const updateFields = {
                status: 'CANCELBYCUSTOMER',
                remark: updateData.remark
            };
            const data = await this.OrderService.updateData(id, updateFields);
            const notificationTitle = "Order Cancel";
            const notificationDescription = `your order has been cancelled by customer`;
            const dataPayload = await this.NotificationModel.save({
                title: notificationTitle,
                description: notificationDescription,
                user_id: realUser.id,
                click_event: 'order',
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
            return { status: true, message: common_messages_1.CommonMessages.updated_data('Order'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
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
    async getOrderAddressDistance(body) {
        const { order_id } = body;
        if (!order_id) {
            throw new Error('Missing required parameter: order_id');
        }
        try {
            const order = await this.Order.findOne({
                where: { id: order_id },
            });
            if (!order) {
                throw new Error('Order not found');
            }
            const { address_id, provider_id } = order;
            const userAddress = await this.User_location.findOne({
                where: { id: address_id },
            });
            if (!userAddress) {
                throw new Error('User address not found');
            }
            const providerAddress = await this.User_location.findOne({
                where: { user_id: provider_id },
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
            return {
                status: true,
                message: 'Addresses and distance fetched successfully',
                data: {
                    userAddress: {
                        latitude: userAddress.latitude,
                        longitude: userAddress.longitude,
                        address: userAddress.address,
                    },
                    providerAddress: {
                        latitude: providerAddress.latitude,
                        longitude: providerAddress.longitude,
                        address: providerAddress.address,
                    },
                    distance: {
                        value: distance / 1000,
                        formatted: formattedDistance,
                    },
                    travelTime: {
                        value: Math.round(duration / 60),
                        formatted: formattedDuration,
                    },
                },
            };
        }
        catch (error) {
            console.error('Error fetching address and distance', error);
            return {
                status: false,
                message: error.message || 'An error occurred while processing your request',
            };
        }
    }
    async getpayment(req, id) {
        try {
            const user_id = req.user.id;
            const data = await this.OrderService.getpayment(id);
            return {
                status: true,
                message: 'Transaction data get success',
                data
            };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
};
__decorate([
    (0, common_1.Post)('/find-nearby-providers'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "findNearbyProviders", null);
__decorate([
    (0, common_1.Post)('/place-order'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "orderCreate", null);
__decorate([
    (0, common_1.Post)('wallet-cash'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "createCashWalletData", null);
__decorate([
    (0, common_1.Get)('order-list'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getOrderList", null);
__decorate([
    (0, common_1.Get)('arrival-order-list'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getArrivalOrderList", null);
__decorate([
    (0, common_1.Put)('order-cancle/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "orderCancle", null);
__decorate([
    (0, common_1.Post)('/get-order-trace'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getOrderAddressDistance", null);
__decorate([
    (0, common_1.Get)('payment-details/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getpayment", null);
OrderController = __decorate([
    (0, common_1.Controller)('/customer/product'),
    (0, common_1.UseGuards)(user_guard_1.UserGuard),
    __param(1, (0, typeorm_2.InjectRepository)(order_schema_1.Order)),
    __param(2, (0, typeorm_2.InjectRepository)(user_location_schema_1.User_location)),
    __param(3, (0, typeorm_2.InjectRepository)(user_schema_1.User)),
    __param(4, (0, typeorm_2.InjectRepository)(wallet_req_schema_1.Wallet_req)),
    __param(5, (0, typeorm_2.InjectRepository)(setting_schema_1.Setting)),
    __param(6, (0, typeorm_2.InjectRepository)(notification_schema_1.Notification)),
    __metadata("design:paramtypes", [order_management_service_1.OrderService,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository])
], OrderController);
exports.OrderController = OrderController;
//# sourceMappingURL=order_management.controller.js.map