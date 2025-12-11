// src/template/template.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProductService } from './product_management.service';
import { CommonMessages } from 'src/common/common-messages';
import { AdminGuard } from 'src/authGuard/admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import * as xlsx from 'xlsx';
import { Product } from 'src/schema/product.schema';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OptionsMessage } from 'src/common/options';
import { Category } from 'src/schema/category.schema';

@Controller('/product')
@UseGuards(AdminGuard)
export class ProductController {
    constructor(
        private readonly ProductService: ProductService,
        @InjectRepository(Product)
        private readonly ProductModel: Repository<Product>,
        @InjectRepository(Category)
        private readonly CategoryModel: Repository<Category>,
    ) { }

    @Get('list')
    async getList(@Req() req: any) {
        try {
            const { page, size, s } = req.query;
            const data = await this.ProductService.getAllPages(page, size, s);
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
    async createdata(@Body() createDto: any, @Req() req) {
        try {
            // let { local } = req.query
            // if (local == OptionsMessage.LOCAL_TYPE.ARABIC) {
            //     createDto.ar_product_name = createDto.product_name
            //     createDto.ar_description_name = createDto.description_name
            //     delete createDto.product_name
            //     delete createDto.description_name
            // }
            const data = await this.ProductService.createData(createDto);
            return { status: true, message: CommonMessages.created_data('Product'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Put('update/:id')
    async updatedata(@Param('id') id: number, @Body() updateData: any, @Req() req) {
        try {
            // let { local } = req.query
            // if (local == OptionsMessage.LOCAL_TYPE.ARABIC) {
            //     updateData.ar_product_name = updateData.product_name
            //     updateData.ar_description_name = updateData.description_name
            //     delete updateData.product_name
            //     delete updateData.description_name
            // }
            const data = await this.ProductService.updateData(id, updateData);
            return { status: true, message: CommonMessages.updated_data('Product'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Delete('delete/:id')
    async deletedata(@Param('id') id: number) {
        try {
            await this.ProductService.deleteData(id);
            return { status: true, message: CommonMessages.deleted_data('Product') };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Delete('bulkdelete')
    async bulkDeletedata(@Body('ids') ids: number[]) {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                return { status: false, message: `Please select product for delete`, };
            }

            const deletedCount = await this.ProductService.bulkDeletedata(ids);

            return { status: true, message: `${deletedCount} product deleted successfully`, };
        } catch (error) {
            return { status: false, message: error.message, };
        }
    }

    @Patch('export')
    async exportProductsToXLSX(@Req() req, @Res() res) {
        try {
            const { search = '' } = req.query;
    
            // Initialize Query Builder for products
            const queryBuilder = this.ProductModel.createQueryBuilder('product')
                .select([
                    'product.id',
                    'product.product_name',
                    'product.ar_product_name',
                    'product.description_name',
                    'product.ar_description_name',
                    'product.product_price',
                    'product.delievery_charge',
                    'product.delievery_address',
                    'product.product_img',
                    'product.product_unit',
                    'product.category_id',
                    'product.is_active',
                    'product.createdAt',
                    'product.updatedAt',
                ])
                .orderBy('product.createdAt', 'DESC');
    
            // Execute query and fetch all products
            const products = await queryBuilder.getMany();
    
            // Fetch category details based on category_id
            const categoryIds = products.map((product) => product.category_id);
            const categories = await this.CategoryModel.findByIds(categoryIds);
    
            // Fetch parent category details
            const parentCategoryIds = categories.map((category) => category.parent_category_id).filter(Boolean);
            const parentCategories = await this.CategoryModel.findByIds(parentCategoryIds);
    
            // Map categories and parent categories
            const exportedData = products.map((product) => {
                const category = categories.find((c) => c.id === product.category_id);
                const parentCategory = parentCategories.find((pc) => pc.id === category?.parent_category_id);
    
                return {
                    "ID": product.id || '',
                    "Product Name": product.product_name || '',
                    "Arabic Product Name": product.ar_product_name || '',
                    "Description": product.description_name || '',
                    "Arabic Description": product.ar_description_name || '',
                    "Price": product.product_price || '',
                    "Delivery Charge": product.delievery_charge || '',
                    "Delivery Address": product.delievery_address || '',
                    "Product Image": product.product_img || '',
                    "Unit": product.product_unit || '',
                    "Category": category?.category_name || '',
                    "Parent Category": parentCategory?.category_name || '',
                    "Created At": new Date(product.createdAt).toLocaleString(),
                    "Updated At": new Date(product.updatedAt).toLocaleString(),
                    "Is Active": product.is_active ? 'Active' : 'Inactive',
                };
            });
    
            // Create Excel sheet
            const ws = xlsx.utils.json_to_sheet(exportedData);
            const wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, ws, 'Product List');
    
            const buffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });
    
            // Set response headers
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=product_list_export.xlsx');
            res.setHeader('Content-Length', buffer.length.toString());
    
            return res.send(buffer);
        } catch (error) {
            console.error('Error exporting products:', error);
            return res.status(500).json({ status: false, message: error.message });
        }
    }
    


}
