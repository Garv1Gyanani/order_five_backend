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
var Category_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const typeorm_1 = require("typeorm");
const product_schema_1 = require("./product.schema");
const category_request_schema_1 = require("./category_request.schema");
let Category = Category_1 = class Category {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Category.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Category.prototype, "provider_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, default: '', charset: 'utf8mb4', collation: 'utf8mb4_general_ci' }),
    __metadata("design:type", String)
], Category.prototype, "category_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Category.prototype, "category_img", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, default: '', charset: 'utf8mb4', collation: 'utf8mb4_general_ci' }),
    __metadata("design:type", String)
], Category.prototype, "ar_category_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Category.prototype, "parent_category_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Category.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", Number)
], Category.prototype, "category_req_id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Category.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Category.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], Category.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Category_1, category => category.children),
    (0, typeorm_1.JoinColumn)({ name: 'parent_category_id' }),
    __metadata("design:type", Category)
], Category.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Category_1, category => category.parent),
    __metadata("design:type", Array)
], Category.prototype, "children", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => product_schema_1.Product, Product => Product.category),
    __metadata("design:type", Array)
], Category.prototype, "categorydata", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => category_request_schema_1.CategoryRequest, (categoryRequest) => categoryRequest.parent_category),
    __metadata("design:type", Array)
], Category.prototype, "parentcategorydata", void 0);
Category = Category_1 = __decorate([
    (0, typeorm_1.Entity)('category')
], Category);
exports.Category = Category;
//# sourceMappingURL=category.schema.js.map