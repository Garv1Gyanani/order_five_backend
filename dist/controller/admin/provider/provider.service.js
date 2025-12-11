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
exports.ProviderService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_schema_1 = require("../../../schema/user.schema");
const bcrypt = require("bcryptjs");
const common_util_1 = require("../../../common/common.util");
const options_1 = require("../../../common/options");
const common_messages_1 = require("../../../common/common-messages");
const user_document_schema_1 = require("../../../schema/user_document.schema");
const moment = require("moment-timezone");
const rating_schema_1 = require("../../../schema/rating.schema");
const subscription_schema_1 = require("../../../schema/subscription.schema");
let ProviderService = class ProviderService {
    constructor(UserModel, UserDocumentModel, RatingModel, SubscriptionModel) {
        this.UserModel = UserModel;
        this.UserDocumentModel = UserDocumentModel;
        this.RatingModel = RatingModel;
        this.SubscriptionModel = SubscriptionModel;
    }
    async getUserData(id) {
        try {
            const user = await this.UserModel.findOne({ where: { id: id } });
            if (!user) {
                throw new Error(common_messages_1.CommonMessages.notFound('Provider'));
            }
            const { password } = user, userData = __rest(user, ["password"]);
            return userData;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getUserList() {
        try {
            const users = await this.UserModel.find({ where: { user_role: options_1.OptionsMessage.USER_ROLE.PROVIDER } });
            if (!users || users.length === 0) {
                throw new Error(common_messages_1.CommonMessages.notFound('Provider'));
            }
            return users;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getAllPages(page = 1, pageSize = 10, search = '') {
        try {
            const { limit, offset } = common_util_1.default.getPagination(page, pageSize);
            let whereConditions = { user_role: options_1.OptionsMessage.USER_ROLE.PROVIDER };
            if (search) {
                whereConditions = [
                    { user_role: options_1.OptionsMessage.USER_ROLE.PROVIDER, phone_num: (0, typeorm_2.Like)(`%${search}%`) },
                    { user_role: options_1.OptionsMessage.USER_ROLE.PROVIDER, email: (0, typeorm_2.Like)(`%${search}%`) },
                    { user_role: options_1.OptionsMessage.USER_ROLE.PROVIDER, name: (0, typeorm_2.Like)(`%${search}%`) },
                ];
            }
            const [providers, count] = await this.UserModel.findAndCount({
                where: whereConditions,
                skip: offset,
                take: limit,
                order: { createdAt: 'DESC' },
            });
            const providerIds = providers.map((provider) => provider.id);
            const subscriptionIds = providers
                .map((provider) => provider.subscription_id)
                .filter((id) => id !== null);
            let ratings = [];
            if (providerIds.length > 0) {
                ratings = await this.RatingModel.createQueryBuilder('ratings')
                    .select('ratings.provider_id', 'providerId')
                    .addSelect('AVG(ratings.rating)', 'averageRating')
                    .addSelect('COUNT(ratings.rating)', 'ratingCount')
                    .where('ratings.provider_id IN (:...providerIds)', { providerIds })
                    .groupBy('ratings.provider_id')
                    .getRawMany();
            }
            let subscriptionsMap = {};
            if (subscriptionIds.length > 0) {
                const subscriptions = await this.SubscriptionModel.find({
                    where: { id: (0, typeorm_2.In)(subscriptionIds) },
                    select: ['id', 'name'],
                });
                subscriptionsMap = subscriptions.reduce((acc, sub) => {
                    acc[sub.id] = sub.name;
                    return acc;
                }, {});
            }
            const roundToHalf = (value) => Math.round(value * 2) / 2;
            const ratingsMap = ratings.reduce((acc, rating) => {
                acc[rating.providerId] = {
                    averageRating: roundToHalf(parseFloat(rating.averageRating)),
                    ratingCount: parseInt(rating.ratingCount, 10),
                };
                return acc;
            }, {});
            const providersWithDetails = providers.map((provider) => {
                var _a, _b;
                return (Object.assign(Object.assign({}, provider), { averageRating: ((_a = ratingsMap[provider.id]) === null || _a === void 0 ? void 0 : _a.averageRating) || 0, ratingCount: ((_b = ratingsMap[provider.id]) === null || _b === void 0 ? void 0 : _b.ratingCount) || 0, plan_type: provider.subscription_id ? subscriptionsMap[provider.subscription_id] || null : null }));
            });
            const paginatedData = common_util_1.default.getPagingData({ count, rows: providersWithDetails }, page, limit);
            return paginatedData;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async createUserData(data) {
        try {
            data.createdAt = moment.tz('Asia/Riyadh').format('YYYY-MM-DD HH:mm:ss');
            data.user_role = options_1.OptionsMessage.USER_ROLE.PROVIDER;
            const user = await this.UserModel.findOne({ where: { phone_num: data.phone_num } });
            if (user) {
                throw new Error(common_messages_1.CommonMessages.alreadyFound('Provider'));
            }
            let newUser = await this.UserModel.create(data);
            newUser = await this.UserModel.save(newUser);
            return newUser;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async updateUserData(id, updateData) {
        try {
            const user = await this.UserModel.findOne({ where: { id: id } });
            if (!user) {
                throw new Error(common_messages_1.CommonMessages.notFound('Provider'));
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
    async deleteUserData(id) {
        try {
            const user = await this.UserModel.findOne({ where: { id: id } });
            if (!user) {
                throw new Error(common_messages_1.CommonMessages.notFound('Provider'));
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
                throw new Error(common_messages_1.CommonMessages.notFound('Provider'));
            }
            const result = await this.UserModel.softDelete(ids);
            return result.affected || 0;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async createUserDocument(data) {
        try {
            let response = await this.UserDocumentModel.create(data);
            response = await this.UserDocumentModel.save(response);
            return response;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async GetUserDocument(user_id) {
        var _a, _b, _c, _d;
        try {
            let response = await this.UserDocumentModel.find({
                where: { user_id: user_id },
                relations: ['required_doc'],
                select: {
                    required_doc: { id: true, title: true, ar_title: true, type: true, is_required: true }
                },
            });
            response = await this.UserDocumentModel.save(response);
            let newresponse = [];
            for (const element of response) {
                newresponse.push({
                    "id": element === null || element === void 0 ? void 0 : element.id,
                    "user_id": element === null || element === void 0 ? void 0 : element.user_id,
                    "required_doc_id": element === null || element === void 0 ? void 0 : element.required_doc_id,
                    "document": element === null || element === void 0 ? void 0 : element.document,
                    "preview": element === null || element === void 0 ? void 0 : element.document,
                    "status": element === null || element === void 0 ? void 0 : element.status,
                    "createdAt": element === null || element === void 0 ? void 0 : element.createdAt,
                    "updatedAt": element === null || element === void 0 ? void 0 : element.updatedAt,
                    "deletedAt": element === null || element === void 0 ? void 0 : element.deletedAt,
                    "title": (_a = element === null || element === void 0 ? void 0 : element.required_doc) === null || _a === void 0 ? void 0 : _a.title,
                    "ar_title": (_b = element === null || element === void 0 ? void 0 : element.required_doc) === null || _b === void 0 ? void 0 : _b.ar_title,
                    "is_required": (_c = element === null || element === void 0 ? void 0 : element.required_doc) === null || _c === void 0 ? void 0 : _c.is_required,
                    "type": (_d = element === null || element === void 0 ? void 0 : element.required_doc) === null || _d === void 0 ? void 0 : _d.type,
                });
            }
            return newresponse;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async UpdateUserDocument(id, data) {
        try {
            let response = await this.UserDocumentModel.update(id, data);
            return response;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async changePassword(id, old_pass, new_pass, confirm_pass) {
        try {
            if (new_pass !== confirm_pass) {
                throw new Error(common_messages_1.CommonMessages.PWD_NOT_MATCH);
            }
            const user = await this.UserModel.findOne({ where: { id: id } });
            if (!user) {
                throw new Error(common_messages_1.CommonMessages.notFound('Provider'));
            }
            const isCurrentPasswordValid = await bcrypt.compare(old_pass, user.password);
            if (!isCurrentPasswordValid) {
                throw new Error('Current password is incorrect');
            }
            const salt = await bcrypt.genSalt();
            const hashedNewPassword = await bcrypt.hash(new_pass, salt);
            user.password = hashedNewPassword;
            await this.UserModel.save(user);
            return user;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
};
ProviderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_schema_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(user_document_schema_1.User_document)),
    __param(2, (0, typeorm_1.InjectRepository)(rating_schema_1.Rating)),
    __param(3, (0, typeorm_1.InjectRepository)(subscription_schema_1.Subscription)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ProviderService);
exports.ProviderService = ProviderService;
//# sourceMappingURL=provider.service.js.map