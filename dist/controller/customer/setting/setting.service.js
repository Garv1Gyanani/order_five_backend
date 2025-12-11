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
exports.SettingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const setting_schema_1 = require("../../../schema/setting.schema");
const common_messages_1 = require("../../../common/common-messages");
let SettingService = class SettingService {
    constructor(SettingModel) {
        this.SettingModel = SettingModel;
    }
    async getAllkeys(keys) {
        try {
            const query = {};
            if (keys && keys.length > 0) {
                query.key = (0, typeorm_2.In)(keys);
            }
            const data = await this.SettingModel.find({ where: query });
            return data;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getAllPages(search) {
        try {
            const data = await this.SettingModel.find();
            return data;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getDatabyid(key) {
        try {
            const setting = await this.SettingModel.findOne({ where: { key } });
            if (!setting) {
                throw new Error(common_messages_1.CommonMessages.notFound('Setting'));
            }
            return setting;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
};
SettingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(setting_schema_1.Setting)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SettingService);
exports.SettingService = SettingService;
//# sourceMappingURL=setting.service.js.map