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
const common_messages_1 = require("../../../common/common-messages");
let UserLocationService = class UserLocationService {
    constructor(UserLocationModel) {
        this.UserLocationModel = UserLocationModel;
    }
    async getAllPages(user_id) {
        try {
            let whereCondition = { user_id: user_id };
            const data = await this.UserLocationModel.findOne({
                where: whereCondition
            });
            return data;
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
    async createOrUpdateData(data, user_id) {
        try {
            let existingLocation = await this.UserLocationModel.findOne({ where: { user_id: user_id } });
            if (existingLocation) {
                existingLocation = Object.assign(Object.assign({}, existingLocation), data);
                let updatedLocation = await this.UserLocationModel.save(existingLocation);
                return updatedLocation;
            }
            else {
                let response = await this.UserLocationModel.create(data);
                response = await this.UserLocationModel.save(response);
                return response;
            }
        }
        catch (error) {
            console.error('Error:', error);
            throw new Error(error.message.includes('maximum of 10 addresses') ? error.message : 'An error occurred while creating or updating the location. Please try again later.');
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