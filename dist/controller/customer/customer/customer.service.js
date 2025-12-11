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
exports.CustomerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_schema_1 = require("../../../schema/user.schema");
const bcrypt = require("bcryptjs");
const common_util_1 = require("../../../common/common.util");
const options_1 = require("../../../common/options");
const common_messages_1 = require("../../../common/common-messages");
const user_document_schema_1 = require("../../../schema/user_document.schema");
const rating_schema_1 = require("../../../schema/rating.schema");
const notification_schema_1 = require("../../../schema/notification.schema");
let CustomerService = class CustomerService {
    constructor(UserModel, CustomerDocumentModel, NotificationService, RatingModel) {
        this.UserModel = UserModel;
        this.CustomerDocumentModel = CustomerDocumentModel;
        this.NotificationService = NotificationService;
        this.RatingModel = RatingModel;
    }
    async getCustomerData(id) {
        try {
            const customer = await this.UserModel.findOne({ where: { user_role: options_1.OptionsMessage.USER_ROLE.CUSTOMER, id: id } });
            if (!customer) {
                throw new Error(common_messages_1.CommonMessages.notFound('Customer'));
            }
            const { password } = customer, customerData = __rest(customer, ["password"]);
            const customerRatings = await this.RatingModel.find({
                where: { customer_id: id },
            });
            const totalRatings = customerRatings.length;
            const averageRating = totalRatings > 0
                ? Math.round((customerRatings.reduce((sum, rating) => sum + parseFloat(rating.rating || "0"), 0) / totalRatings) * 2) / 2
                : 0;
            return Object.assign(Object.assign({}, customerData), { totalRatings, averageRating: averageRating.toFixed(1) });
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getCustomerList() {
        try {
            const customers = await this.UserModel.find({ where: { user_role: options_1.OptionsMessage.USER_ROLE.CUSTOMER } });
            if (!customers || customers.length === 0) {
                throw new Error(common_messages_1.CommonMessages.notFound('Customer'));
            }
            return customers;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getAllPages(page = 1, pageSize = 10, search = '') {
        try {
            const { limit, offset } = common_util_1.default.getPagination(page, pageSize);
            const [pages, count] = await this.UserModel.findAndCount({
                where: Object.assign({ user_role: options_1.OptionsMessage.USER_ROLE.CUSTOMER }, (search && { name: (0, typeorm_2.Like)(`%${search}%`) })),
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
    async getCustomerDatabyid(id) {
        try {
            const customer = await this.UserModel.findOne({ where: { id: id } });
            if (!customer) {
                throw new Error(common_messages_1.CommonMessages.notFound('Customer'));
            }
            return customer;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async createCustomerData(data) {
        try {
            data.user_role = options_1.OptionsMessage.USER_ROLE.CUSTOMER;
            const customer = await this.UserModel.findOne({ where: { phone_num: data.phone_num } });
            if (customer) {
                throw new Error(common_messages_1.CommonMessages.alreadyFound('Customer'));
            }
            let newCustomer = await this.UserModel.create(data);
            newCustomer = await this.UserModel.save(newCustomer);
            return newCustomer;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async updateCustomerData(id, updateData) {
        try {
            const customer = await this.UserModel.findOne({ where: { id: id } });
            if (!customer) {
                throw new Error(common_messages_1.CommonMessages.notFound('Customer'));
            }
            let response = await this.UserModel.update(id, updateData);
            if (response[0] === 0) {
                throw new Error("No customer data was updated.");
            }
            return response;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async deleteCustomerData(id) {
        try {
            const customer = await this.UserModel.findOne({ where: { id: id } });
            if (!customer) {
                throw new Error(common_messages_1.CommonMessages.notFound('Customer'));
            }
            await this.UserModel.softDelete(id);
            return customer;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async createCustomerDocument(data) {
        try {
            let response = await this.CustomerDocumentModel.create(data);
            response = await this.CustomerDocumentModel.save(response);
            return response;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async GetCustomerDocument(customer_id) {
        try {
            let response = await this.CustomerDocumentModel.find({ where: { user_id: customer_id } });
            response = await this.CustomerDocumentModel.save(response);
            return response;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async UpdateCustomerDocument(id, data) {
        try {
            let response = await this.CustomerDocumentModel.update(id, data);
            response = await this.CustomerDocumentModel.save(response);
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
            const customer = await this.UserModel.findOne({ where: { id: id } });
            if (!customer) {
                throw new Error(common_messages_1.CommonMessages.notFound('Customer'));
            }
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, customer.password);
            if (!isCurrentPasswordValid) {
                throw new Error('Current password is incorrect');
            }
            const salt = await bcrypt.genSalt();
            const hashedNewPassword = await bcrypt.hash(newPassword, salt);
            customer.password = hashedNewPassword;
            await this.UserModel.save(customer);
            return customer;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getAllNotificationPages(customer_id, page = 1, pageSize = 10, search = '') {
        try {
            const { limit, offset } = common_util_1.default.getPagination(page, pageSize);
            const [pages, count] = await this.NotificationService.findAndCount({
                where: [
                    { user_id: customer_id },
                    { user_id: null, user_type: 'customer' },
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
CustomerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_schema_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(user_document_schema_1.User_document)),
    __param(2, (0, typeorm_1.InjectRepository)(notification_schema_1.Notification)),
    __param(3, (0, typeorm_1.InjectRepository)(rating_schema_1.Rating)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CustomerService);
exports.CustomerService = CustomerService;
//# sourceMappingURL=customer.service.js.map