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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const common_messages_1 = require("../../../common/common-messages");
const admin_guard_1 = require("../../../authGuard/admin.guard");
const options_1 = require("../../../common/options");
const product_schema_1 = require("../../../schema/product.schema");
const category_schema_1 = require("../../../schema/category.schema");
const user_schema_1 = require("../../../schema/user.schema");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_request_schema_1 = require("../../../schema/product_request.schema");
const category_request_schema_1 = require("../../../schema/category_request.schema");
const user_document_schema_1 = require("../../../schema/user_document.schema");
const wallet_req_schema_1 = require("../../../schema/wallet_req.schema");
const rating_schema_1 = require("../../../schema/rating.schema");
const report_schema_1 = require("../../../schema/report.schema");
let DashboardController = class DashboardController {
    constructor(UserModel, ProductModel, CategoryModel, ProductRequestModel, CategoryRequestModel, UserDocumentModel, WalletReqModel, Rating, Report) {
        this.UserModel = UserModel;
        this.ProductModel = ProductModel;
        this.CategoryModel = CategoryModel;
        this.ProductRequestModel = ProductRequestModel;
        this.CategoryRequestModel = CategoryRequestModel;
        this.UserDocumentModel = UserDocumentModel;
        this.WalletReqModel = WalletReqModel;
        this.Rating = Rating;
        this.Report = Report;
    }
    async getList(req) {
        try {
            let CategoryRequest = await this.CategoryRequestModel.count({ where: { status: options_1.OptionsMessage.CATEGORY_STATUS.Requested } });
            let ProductRequest = await this.ProductRequestModel.count({ where: { status: options_1.OptionsMessage.PRODUCT_STATUS.Requested } });
            const userDocuments = await this.UserDocumentModel.find({
                where: { status: options_1.OptionsMessage.USER_DOCUMENT.Requested },
                select: ['user_id']
            });
            const userPendingCount = await this.UserModel.count({
                where: { status: 'Pending' }
            });
            const uniqueUserIds = [...new Set(userDocuments.map(doc => doc.user_id))];
            let WalletReqRequest = await this.WalletReqModel.count({ where: { status: options_1.OptionsMessage.WALLET_STATUS.Requested } });
            let response = {
                requested_product: ProductRequest,
                requested_categorys: CategoryRequest,
                payment_approvals: WalletReqRequest,
                provider_doc: userPendingCount
            };
            return { status: true, message: common_messages_1.CommonMessages.GET_LIST('Dashboard'), data: response };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async getSecondboxList(req) {
        try {
            let { start_date, end_date } = req.query;
            const startDate = start_date ? new Date(start_date) : null;
            const endDate = end_date ? new Date(end_date) : null;
            const dateFilter = startDate && endDate
                ? { createdAt: (0, typeorm_2.Between)(startDate, endDate) }
                : {};
            const total_product = await this.ProductModel.count({ where: dateFilter });
            const total_category = await this.CategoryModel.count({ where: dateFilter });
            const total_provider = await this.UserModel.count({ where: Object.assign({ user_role: options_1.OptionsMessage.USER_ROLE.PROVIDER }, dateFilter), });
            const total_customer = await this.UserModel.count({ where: Object.assign({ user_role: options_1.OptionsMessage.USER_ROLE.CUSTOMER }, dateFilter), });
            const missuseReport = await this.Report.count({ where: Object.assign({}, dateFilter), });
            const customerWalletSum = await this.WalletReqModel.createQueryBuilder('wallet')
                .select('SUM(wallet.amount)', 'totalAmount')
                .where(Object.assign({ user_type: 'Customer', status: options_1.OptionsMessage.WALLET_STATUS.Approved }, dateFilter))
                .getRawOne();
            const providerWalletSum = await this.WalletReqModel.createQueryBuilder('wallet')
                .select('SUM(wallet.amount)', 'totalAmount')
                .where(Object.assign({ user_type: 'Provider', status: options_1.OptionsMessage.WALLET_STATUS.Approved }, dateFilter))
                .getRawOne();
            const response = {
                total_provider: total_provider,
                total_customer: total_customer,
                total_product: total_product,
                total_category: total_category,
                report_of_misuse: missuseReport,
                customer_wallet_amount: (customerWalletSum === null || customerWalletSum === void 0 ? void 0 : customerWalletSum.totalAmount) || 0,
                provider_wallet_amount: (providerWalletSum === null || providerWalletSum === void 0 ? void 0 : providerWalletSum.totalAmount) || 0,
            };
            return { status: true, message: common_messages_1.CommonMessages.GET_LIST('Dashboard'), data: response };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
};
__decorate([
    (0, common_1.Get)('getcounts'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getList", null);
__decorate([
    (0, common_1.Get)('getsecondboxcounts'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getSecondboxList", null);
DashboardController = __decorate([
    (0, common_1.Controller)('/dashboard'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, typeorm_1.InjectRepository)(user_schema_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(product_schema_1.Product)),
    __param(2, (0, typeorm_1.InjectRepository)(category_schema_1.Category)),
    __param(3, (0, typeorm_1.InjectRepository)(product_request_schema_1.ProductRequest)),
    __param(4, (0, typeorm_1.InjectRepository)(category_request_schema_1.CategoryRequest)),
    __param(5, (0, typeorm_1.InjectRepository)(user_document_schema_1.User_document)),
    __param(6, (0, typeorm_1.InjectRepository)(wallet_req_schema_1.Wallet_req)),
    __param(7, (0, typeorm_1.InjectRepository)(rating_schema_1.Rating)),
    __param(8, (0, typeorm_1.InjectRepository)(report_schema_1.Report)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DashboardController);
exports.DashboardController = DashboardController;
//# sourceMappingURL=dashboard.controller.js.map