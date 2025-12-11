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
exports.User_document = void 0;
const typeorm_1 = require("typeorm");
const required_doc_schema_1 = require("./required_doc.schema");
let User_document = class User_document {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User_document.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], User_document.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], User_document.prototype, "required_doc_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => required_doc_schema_1.Required_doc, Required_doc => Required_doc.userdocumentrequests),
    (0, typeorm_1.JoinColumn)({ name: 'required_doc_id' }),
    __metadata("design:type", required_doc_schema_1.Required_doc)
], User_document.prototype, "required_doc", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: '' }),
    __metadata("design:type", String)
], User_document.prototype, "document", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: 'Requested' }),
    __metadata("design:type", String)
], User_document.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], User_document.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], User_document.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], User_document.prototype, "deletedAt", void 0);
User_document = __decorate([
    (0, typeorm_1.Entity)('user_document')
], User_document);
exports.User_document = User_document;
//# sourceMappingURL=user_document.schema.js.map