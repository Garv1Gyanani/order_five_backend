// src/template/template.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProductService } from './product_management.service';
import { CommonMessages } from 'src/common/common-messages';
import { ProviderGuard } from 'src/authGuard/provider.guard';

@Controller('/provider/product')
@UseGuards(ProviderGuard)
export class ProductController {
    constructor(private readonly ProductService: ProductService) { }

    @Get('list')
    async getList(@Req() req: any) {
        try {
            const { page, size, s, category_id } = req.query;
            const data = await this.ProductService.getAllPages(page, size, s, category_id);
            return { status: true, message: CommonMessages.GET_LIST('Product'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Get('get/:id')
    async getbyId(@Param('id') id: number) {
        try {
            const data = await this.ProductService.getData(id);
            return { status: true, message: CommonMessages.GET_DATA('Product'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Post('create')
    async createProfile(@Body() createDto: any) {
        try {
            const data = await this.ProductService.createData(createDto);
            return { status: true, message: CommonMessages.created_data('Product'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Put('update/:id')
    async updateProfile(@Param('id') id: number, @Body() updateData: any) {
        try {
            const data = await this.ProductService.updateData(id, updateData);
            return { status: true, message: CommonMessages.updated_data('Product'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Delete('delete/:id')
    async deleteProfile(@Param('id') id: number) {
        try {
            await this.ProductService.deleteData(id);
            return { status: true, message: CommonMessages.deleted_data('Product') };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

}