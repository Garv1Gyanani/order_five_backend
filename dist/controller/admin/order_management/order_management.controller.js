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
const order_schema_1 = require("../../../schema/order.schema");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const admin_guard_1 = require("../../../authGuard/admin.guard");
const user_schema_1 = require("../../../schema/user.schema");
const product_schema_1 = require("../../../schema/product.schema");
const product_request_schema_1 = require("../../../schema/product_request.schema");
const xlsx = require("xlsx");
let OrderController = class OrderController {
    constructor(OrderService, Order, UserRequestModel, ProductModel, ProductRequestModel) {
        this.OrderService = OrderService;
        this.Order = Order;
        this.UserRequestModel = UserRequestModel;
        this.ProductModel = ProductModel;
        this.ProductRequestModel = ProductRequestModel;
    }
    async getOrderList(req) {
        try {
            const { page = 1, size = 10, s = '', status } = req.query;
            const data = await this.OrderService.getOrderList(page, size, s, status);
            return data;
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async OrderListById(id, req) {
        try {
            const data = await this.OrderService.OrderListById(id);
            return data;
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getOrderListById(id, req) {
        try {
            const { page = 1, size = 10, s = '' } = req.query;
            const data = await this.OrderService.getOrderListById(page, size, id);
            return data;
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getcstOrderListById(id, req) {
        try {
            const { page = 1, size = 10, s = '' } = req.query;
            const data = await this.OrderService.getcstOrderListById(page, size, id);
            return data;
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async orderCancle(id, updateData) {
        try {
            const order = await this.Order.findOne({ where: { id } });
            if (!order) {
                return { status: false, message: common_messages_1.CommonMessages.notFound('Order') };
            }
            const updateFields = {
                status: 'CANCELBYADMIN',
                remark: updateData.remark
            };
            const data = await this.OrderService.updateData(id, updateFields);
            return { status: true, message: common_messages_1.CommonMessages.updated_data('Order'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async orderRemark(id, updateData) {
        try {
            const order = await this.Order.findOne({ where: { id } });
            if (!order) {
                return { status: false, message: common_messages_1.CommonMessages.notFound('Order') };
            }
            const updateFields = {
                remark: updateData.remark
            };
            const data = await this.OrderService.updateData(id, updateFields);
            return { status: true, message: common_messages_1.CommonMessages.updated_data('Order'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async orderAccept(id, updateData) {
        try {
            const order = await this.Order.findOne({ where: { id } });
            if (!order) {
                return { status: false, message: common_messages_1.CommonMessages.notFound('Order') };
            }
            const updateFields = {
                status: 'ACCEPTED',
                remark: updateData.remark
            };
            const data = await this.OrderService.updateData(id, updateFields);
            return { status: true, message: common_messages_1.CommonMessages.updated_data('Order'), data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async orderRemove(id) {
        try {
            const order = await this.Order.findOne({ where: { id } });
            if (!order) {
                return { status: false, message: common_messages_1.CommonMessages.notFound('Order') };
            }
            const updateFields = { deletedAt: new Date() };
            const data = await this.OrderService.updateData(id, updateFields);
            return { status: true, message: 'order has been removed successfully', data };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async bulkDeletedata(ids) {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                return { status: false, message: `Please select order for delete`, };
            }
            const deletedCount = await this.OrderService.bulkDeletedata(ids);
            return { status: true, message: `${deletedCount} order deleted successfully`, };
        }
        catch (error) {
            return { status: false, message: error.message, };
        }
    }
    async exportOrderListToXLSX(req, res) {
        try {
            const { status } = req.query;
            let whereCondition = {};
            if (status) {
                whereCondition['status'] = status.toUpperCase();
            }
            const pages = await this.Order.find({
                where: whereCondition,
                order: { createdAt: 'DESC' },
            });
            const customerIds = pages.map((order) => order.user_id);
            const providerIds = pages.map((order) => order.provider_id);
            const productIds = pages.map((order) => order.product_id);
            const providers = await this.UserRequestModel.find({
                where: { id: (0, typeorm_1.In)(providerIds) },
            });
            const customers = await this.UserRequestModel.find({
                where: { id: (0, typeorm_1.In)(customerIds) },
            });
            const productDetails = await this.ProductModel.find({
                where: { id: (0, typeorm_1.In)(productIds) },
            });
            const productRequests = await this.ProductRequestModel.find({
                where: {
                    user_id: (0, typeorm_1.In)(providerIds),
                    product_id: (0, typeorm_1.In)(productIds),
                },
            });
            const exportedData = pages.map((order) => {
                const provider = providers.find((p) => p.id === order.provider_id);
                const customer = customers.find((p) => p.id === order.user_id);
                const product = productDetails.find((p) => p.id === order.product_id);
                const productRequest = productRequests.find((pr) => pr.user_id === order.provider_id && pr.product_id === order.product_id);
                return {
                    "Provider Name": (provider === null || provider === void 0 ? void 0 : provider.name) || '',
                    "Order ID": (order === null || order === void 0 ? void 0 : order.order_id) || '',
                    "Remark": (order === null || order === void 0 ? void 0 : order.remark) || '',
                    "Status": (order === null || order === void 0 ? void 0 : order.status) || '',
                    "Distance": (order === null || order === void 0 ? void 0 : order.distance) || '',
                    "Product Name": (product === null || product === void 0 ? void 0 : product.product_name) || '',
                    "Product Price": (productRequest === null || productRequest === void 0 ? void 0 : productRequest.product_price) || '',
                    "Delivery charge": (productRequest === null || productRequest === void 0 ? void 0 : productRequest.delievery_charge) || '',
                    "Customer Name": (customer === null || customer === void 0 ? void 0 : customer.name) || '',
                    "Customer Address": (customer === null || customer === void 0 ? void 0 : customer.address_one) || '',
                    "Is Active": (order === null || order === void 0 ? void 0 : order.is_active) ? 'Active' : 'Inactive',
                    "Created At": new Date(order === null || order === void 0 ? void 0 : order.createdAt).toLocaleString(),
                };
            });
            const ws = xlsx.utils.json_to_sheet(exportedData);
            const wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, ws, 'Order List');
            const buffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=order_list_export.xlsx');
            res.setHeader('Content-Length', buffer.length.toString());
            return res.send(buffer);
        }
        catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    }
};
__decorate([
    (0, common_1.Get)('order-list'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getOrderList", null);
__decorate([
    (0, common_1.Get)('order-list/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "OrderListById", null);
__decorate([
    (0, common_1.Get)('provider-order-list/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getOrderListById", null);
__decorate([
    (0, common_1.Get)('customer-order-list/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getcstOrderListById", null);
__decorate([
    (0, common_1.Put)('order-cancel/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "orderCancle", null);
__decorate([
    (0, common_1.Put)('order-edit/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "orderRemark", null);
__decorate([
    (0, common_1.Put)('order-accept/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "orderAccept", null);
__decorate([
    (0, common_1.Delete)('order-remove/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "orderRemove", null);
__decorate([
    (0, common_1.Delete)('order-bulkdelete'),
    __param(0, (0, common_1.Body)('ids')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "bulkDeletedata", null);
__decorate([
    (0, common_1.Patch)('order-export'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "exportOrderListToXLSX", null);
OrderController = __decorate([
    (0, common_1.Controller)('/admin/product'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(1, (0, typeorm_2.InjectRepository)(order_schema_1.Order)),
    __param(2, (0, typeorm_2.InjectRepository)(user_schema_1.User)),
    __param(3, (0, typeorm_2.InjectRepository)(product_schema_1.Product)),
    __param(4, (0, typeorm_2.InjectRepository)(product_request_schema_1.ProductRequest)),
    __metadata("design:paramtypes", [order_management_service_1.OrderService,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository])
], OrderController);
exports.OrderController = OrderController;
//# sourceMappingURL=order_management.controller.js.map