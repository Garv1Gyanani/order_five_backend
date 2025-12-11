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
exports.UserLocationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_location_schema_1 = require("../../../schema/user_location.schema");
const common_util_1 = require("../../../common/common.util");
const common_messages_1 = require("../../../common/common-messages");
let UserLocationService = class UserLocationService {
    constructor(UserLocationModel) {
        this.UserLocationModel = UserLocationModel;
    }
    async getAllPages(user_id, page = 1, pageSize = 10, search = '') {
        try {
            const { limit, offset } = common_util_1.default.getPagination(page, pageSize);
            let whereCondition = { user_id: user_id };
            if (search) {
                whereCondition.address = (0, typeorm_2.Like)(`%${search}%`);
            }
            const [pages, count] = await this.UserLocationModel.findAndCount({
                where: whereCondition,
                skip: offset,
                take: limit,
                order: { createdAt: 'ASC' }
            });
            const paginatedData = common_util_1.default.getPagingData({ count, rows: pages }, page, limit);
            return paginatedData;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getData(id) {
        try {
            const UserLocation = await this.UserLocationModel.findOne({ where: { id: id } });
            if (!UserLocation) {
                throw new Error(common_messages_1.CommonMessages.notFound("User location"));
            }
            return UserLocation;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getDatabyid(id) {
        try {
            const UserLocation = await this.UserLocationModel.findOne({ where: { id: id } });
            if (!UserLocation) {
                throw new Error(common_messages_1.CommonMessages.notFound("User location"));
            }
            return UserLocation;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async createData(data) {
        try {
            const userLocations = await this.UserLocationModel.find({ where: { user_id: data.user_id } });
            if (userLocations.length >= 10) {
                throw new Error('You can add only a maximum of 10 addresses.');
            }
            const newLocation = this.UserLocationModel.create(data);
            const savedLocation = await this.UserLocationModel.save(newLocation);
            return savedLocation;
        }
        catch (error) {
            console.error('Error:', error.message);
            throw new Error(error.message.includes('maximum of 10 addresses')
                ? error.message
                : 'An error occurred while creating the location. Please try again later.');
        }
    }
    async updateData(id, updateData) {
        try {
            if (updateData.default === 1) {
                const currentRecord = await this.UserLocationModel.findOne({ where: { id } });
                if (!currentRecord) {
                    throw new Error("User Location record not found.");
                }
                await this.UserLocationModel.update({ user_id: currentRecord.user_id, id: (0, typeorm_2.Not)(id) }, { default: 0 });
            }
            const response = await this.UserLocationModel.update({ id }, updateData);
            if (response.affected === 0) {
                throw new Error("User Location data was not updated.");
            }
            const updatedRecord = await this.UserLocationModel.findOne({ where: { id } });
            return updatedRecord;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async deleteData(id) {
        try {
            const UserLocation = await this.UserLocationModel.findOne({ where: { id: id } });
            if (!UserLocation) {
                throw new Error(common_messages_1.CommonMessages.notFound("User location"));
            }
            await this.UserLocationModel.softDelete(id);
            return UserLocation;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
};
UserLocationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_location_schema_1.User_location)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserLocationService);
exports.UserLocationService = UserLocationService;
//# sourceMappingURL=user_location.service.js.map