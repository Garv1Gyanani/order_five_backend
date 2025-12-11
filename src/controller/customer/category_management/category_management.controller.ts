// src/template/template.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CategoryService } from './category_management.service';
import { CommonMessages } from 'src/common/common-messages';
import { UserGuard } from 'src/authGuard/user.guard';

@Controller('customer/category')
@UseGuards(UserGuard)
export class CategoryController {
    constructor(private readonly CategoryService: CategoryService) { }

    @Get('list')
    async getList(@Req() req: any) {
        try {
            const { page, size, s, cattype } = req.query;
            const data = await this.CategoryService.getAllPages(page, size, s, cattype);
            return { status: true, message: CommonMessages.GET_LIST('Category'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Get('get/:id')
    async getbyId(@Param('id') id: number) {
        try {
            const data = await this.CategoryService.getData(id);
            return { status: true, message: CommonMessages.GET_DATA('Category'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Get('alllist')
    async getAllList(@Req() req: any) {
        try {
            let { provider_type } = req.query
            const data = await this.CategoryService.getAll(provider_type);
            return { status: true, message: CommonMessages.GET_LIST('Category'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

}
