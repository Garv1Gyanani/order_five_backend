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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRequest = void 0;
const typeorm_1 = require("typeorm");
const user_schema_1 = require("./user.schema");
const category_schema_1 = require("./category.schema");
let CategoryRequest = class CategoryRequest {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CategoryRequest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], CategoryRequest.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_schema_1.User, (user) => user.categoryrequests),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_schema_1.User)
], CategoryRequest.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CategoryRequest.prototype, "provider_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, default: '', charset: 'utf8mb4', collation: 'utf8mb4_general_ci' }),
    __metadata("design:type", String)
], CategoryRequest.prototype, "category_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CategoryRequest.prototype, "category_img", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, default: '', charset: 'utf8mb4', collation: 'utf8mb4_general_ci' }),
    __metadata("design:type", String)
], CategoryRequest.prototype, "ar_category_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], CategoryRequest.prototype, "parent_category_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => category_schema_1.Category, (category) => category.parentcategorydata, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'parent_category_id' }),
    __metadata("design:type", category_schema_1.Category)
], CategoryRequest.prototype, "parent_category", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'Requested' }),
    __metadata("design:type", String)
], CategoryRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CategoryRequest.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CategoryRequest.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], CategoryRequest.prototype, "deletedAt", void 0);
CategoryRequest = __decorate([
    (0, typeorm_1.Entity)('category_request')
], CategoryRequest);
exports.CategoryRequest = CategoryRequest;
//# sourceMappingURL=category_request.schema.js.map