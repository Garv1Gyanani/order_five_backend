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
exports.Required_docService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const required_doc_schema_1 = require("../../../schema/required_doc.schema");
const common_util_1 = require("../../../common/common.util");
const common_messages_1 = require("../../../common/common-messages");
let Required_docService = class Required_docService {
    constructor(Required_docModel) {
        this.Required_docModel = Required_docModel;
    }
    async getList() {
        try {
            const Required_docs = await this.Required_docModel.find({ where: { is_active: true } });
            if (!Required_docs || Required_docs.length === 0) {
                throw new Error(common_messages_1.CommonMessages.notFound('Document'));
            }
            return Required_docs;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getAllPages(page = 1, pageSize = 10, search = '') {
        try {
            const { limit, offset } = common_util_1.default.getPagination(page, pageSize);
            const [pages, count] = await this.Required_docModel.findAndCount({
                where: Object.assign({ is_active: true }, (search && { title: (0, typeorm_2.Like)(`%${search}%`) })),
                skip: offset,
                take: limit,
                order: { createdAt: 'DESC' }
            });
            const parsedPages = pages.map(page => {
                if ((page === null || page === void 0 ? void 0 : page.custom_fields) && typeof page.custom_fields === 'string') {
                    page.custom_fields = JSON.parse(page.custom_fields);
                }
                return page;
            });
            const paginatedData = common_util_1.default.getPagingData({ count, rows: parsedPages }, page, limit);
            return paginatedData;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getbyid(id) {
        try {
            const Required_doc = await this.Required_docModel.findOne({ where: { id } });
            return Required_doc;
        }
        catch (error) {
            return error;
        }
    }
};
Required_docService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(required_doc_schema_1.Required_doc)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], Required_docService);
exports.Required_docService = Required_docService;
//# sourceMappingURL=required_doc.service.js.map