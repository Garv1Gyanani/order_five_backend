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
const moment = require("moment-timezone");
const rating_schema_1 = require("../../../schema/rating.schema");
const order_schema_1 = require("../../../schema/order.schema");
const wallet_req_schema_1 = require("../../../schema/wallet_req.schema");
let CustomerService = class CustomerService {
    constructor(UserModel, RatingModel, Order, wallet_req) {
        this.UserModel = UserModel;
        this.RatingModel = RatingModel;
        this.Order = Order;
        this.wallet_req = wallet_req;
    }
    async getData(id) {
        try {
            const user = await this.UserModel.findOne({
                where: {
                    user_role: options_1.OptionsMessage.USER_ROLE.CUSTOMER,
                    id: id
                }
            });
            if (!user) {
                throw new Error(common_messages_1.CommonMessages.notFound('Customer'));
            }
            const orderCount = await this.Order.count({
                where: {
                    user_id: id,
                    status: (0, typeorm_2.Not)((0, typeorm_2.In)(['CANCELBYCUSTOMER', 'CANCELBYPROVIDER', 'CANCELBYADMIN']))
                }
            });
            const ReviewRating = await this.RatingModel.count({
                where: {
                    customer_id: id,
                }
            });
            const ratings = await this.RatingModel.find({
                where: { customer_id: id },
                select: ['rating']
            });
            const totalRatings = ratings.length;
            const totalRatingSum = ratings.reduce((sum, item) => sum + Number(item.rating), 0);
            const averageRating = totalRatings > 0 ? totalRatingSum / totalRatings : 0;
            const roundedRating = Math.round(averageRating * 2) / 2;
            const walletRequests = await this.wallet_req.find({
                where: {
                    user_id: id,
                    amount_status: 'Debit',
                    status: 'Approved'
                },
                select: ['amount']
            });
            const walletAmount = walletRequests.reduce((sum, req) => sum + Number(req.amount), 0);
            const { password } = user, userData = __rest(user, ["password"]);
            return Object.assign(Object.assign({}, userData), { orderCount, walletAmount, ReviewRating, rating: roundedRating });
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getList() {
        try {
            const users = await this.UserModel.find({ where: { user_role: options_1.OptionsMessage.USER_ROLE.CUSTOMER } });
            if (!users || users.length === 0) {
                throw new Error(common_messages_1.CommonMessages.notFound('Customer'));
            }
            return users;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getAllPages(page = 1, pageSize = 10, search = '', is_active) {
        try {
            const { limit, offset } = common_util_1.default.getPagination(page, pageSize);
            let whereConditions = [{ user_role: options_1.OptionsMessage.USER_ROLE.CUSTOMER }];
            if (search) {
                whereConditions = [
                    { user_role: options_1.OptionsMessage.USER_ROLE.CUSTOMER, phone_num: (0, typeorm_2.Like)(`%${search}%`) },
                    { user_role: options_1.OptionsMessage.USER_ROLE.CUSTOMER, email: (0, typeorm_2.Like)(`%${search}%`) },
                    { user_role: options_1.OptionsMessage.USER_ROLE.CUSTOMER, name: (0, typeorm_2.Like)(`%${search}%`) },
                    { user_role: options_1.OptionsMessage.USER_ROLE.CUSTOMER, address_one: (0, typeorm_2.Like)(`%${search}%`) },
                ];
            }
            if (is_active !== undefined && is_active !== 'all' && is_active !== 'All') {
                const activeStatus = is_active === '1' ? true : is_active === '0' ? false : undefined;
                if (Array.isArray(whereConditions)) {
                    whereConditions = whereConditions.map((condition) => (Object.assign(Object.assign({}, condition), { is_active: activeStatus })));
                }
                else {
                    whereConditions.is_active = activeStatus;
                }
            }
            const [pages, count] = await this.UserModel.findAndCount({
                where: whereConditions,
                skip: offset,
                take: limit,
                order: { id: 'DESC' },
            });
            console.log(pages, "pages");
            const customerIds = pages.map((page) => page.id);
            let ratings = [];
            if (customerIds.length > 0) {
                ratings = await this.RatingModel.createQueryBuilder('ratings')
                    .select('ratings.customer_id', 'customerId')
                    .addSelect('AVG(ratings.rating)', 'averageRating')
                    .addSelect('COUNT(ratings.rating)', 'ratingCount')
                    .where('ratings.customer_id IN (:...customerIds)', { customerIds })
                    .groupBy('ratings.customer_id')
                    .getRawMany();
            }
            const roundToHalf = (value) => Math.round(value * 2) / 2;
            const ratingsMap = ratings.reduce((acc, rating) => {
                acc[rating.customerId] = {
                    averageRating: roundToHalf(parseFloat(rating.averageRating)),
                    ratingCount: parseInt(rating.ratingCount, 10),
                };
                return acc;
            }, {});
            const customersWithRatings = pages.map((customer) => {
                var _a, _b;
                return (Object.assign(Object.assign({}, customer), { averageRating: ((_a = ratingsMap[customer.id]) === null || _a === void 0 ? void 0 : _a.averageRating) || 0, ratingCount: ((_b = ratingsMap[customer.id]) === null || _b === void 0 ? void 0 : _b.ratingCount) || 0 }));
            });
            const paginatedData = common_util_1.default.getPagingData({ count, rows: customersWithRatings }, page, limit);
            return paginatedData;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getDatabyid(id) {
        try {
            const user = await this.UserModel.findOne({ where: { id: id } });
            if (!user) {
                throw new Error(common_messages_1.CommonMessages.notFound('Customer'));
            }
            return user;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async createData(data) {
        try {
            data.user_role = options_1.OptionsMessage.USER_ROLE.CUSTOMER;
            data.createdAt = moment.tz('Asia/Riyadh').format('YYYY-MM-DD HH:mm:ss');
            const user = await this.UserModel.findOne({ where: { phone_num: data.phone_num } });
            if (user) {
                throw new Error(common_messages_1.CommonMessages.alreadyFound('Customer'));
            }
            let newuser = await this.UserModel.create(data);
            newuser = await this.UserModel.save(newuser);
            return newuser;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async updateData(id, updateData) {
        try {
            const user = await this.UserModel.findOne({ where: { id: id } });
            if (!user) {
                throw new Error(common_messages_1.CommonMessages.notFound('Customer'));
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
    async deleteData(id) {
        try {
            const user = await this.UserModel.findOne({ where: { id: id } });
            if (!user) {
                throw new Error(common_messages_1.CommonMessages.notFound('Customer'));
            }
            await this.UserModel.softDelete(id);
            return user;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async bulkDeletedata(ids) {
        try {
            const categories = await this.UserModel.find({ where: { id: (0, typeorm_2.In)(ids) } });
            if (categories.length === 0) {
                throw new Error(common_messages_1.CommonMessages.notFound('Categories'));
            }
            const result = await this.UserModel.softDelete(ids);
            return result.affected || 0;
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
                throw new Error(common_messages_1.CommonMessages.notFound('Customer'));
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
};
CustomerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_schema_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(rating_schema_1.Rating)),
    __param(2, (0, typeorm_1.InjectRepository)(order_schema_1.Order)),
    __param(3, (0, typeorm_1.InjectRepository)(wallet_req_schema_1.Wallet_req)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CustomerService);
exports.CustomerService = CustomerService;
//# sourceMappingURL=customer.service.js.map