// src/template/template.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CategoryService } from './category_management.service';
import { CommonMessages } from 'src/common/common-messages';
import { AdminGuard } from 'src/authGuard/admin.guard';
import * as xlsx from 'xlsx';
import { OptionsMessage } from 'src/common/options';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/schema/category.schema';
import { Repository } from 'typeorm';
import { CategoryRequest } from 'src/schema/category_request.schema';

@Controller('/category')
@UseGuards(AdminGuard)
export class CategoryController {
    constructor(
        private readonly CategoryService: CategoryService,
        @InjectRepository(Category)
        private readonly CategoryModel: Repository<Category>,
        @InjectRepository(CategoryRequest)
        private readonly CategoryRequest: Repository<CategoryRequest>,
    ) { }

    // provider_type, category_name,ar_category_name, category_img,  parent_category_id, is_active
    @Get('list')
    async getList(@Req() req: any) {
        try {
            const { page, size, s } = req.query;
            const data = await this.CategoryService.getAllPages(page, size, s);
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

    @Post('create')
    async createdata(@Body() createDto: any, @Req() req) {
        try {
            // let { local } = req.query
            // if (local == OptionsMessage.LOCAL_TYPE.ARABIC) {
            //     createDto.ar_category_name = createDto.category_name
            //     delete createDto.category_name
            // }
            const data = await this.CategoryService.createData(createDto);
            return { status: true, message: CommonMessages.created_data('Category'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Put('update/:id')
    async updatedata(@Param('id') id: number, @Body() updateData: any, @Req() req) {
        try {
            // let { local } = req.query
            // if (local == OptionsMessage.LOCAL_TYPE.ARABIC) {
            //     updateData.ar_category_name = updateData.category_name
            //     delete updateData.category_name
            // }
            const data = await this.CategoryService.updateData(id, updateData);
            return { status: true, message: CommonMessages.updated_data('Category'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Delete('delete/:id')
    async deletedata(@Param('id') id: number) {
        try {
            await this.CategoryService.deleteData(id);
            return { status: true, message: CommonMessages.deleted_data('Category') };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Delete('bulkdelete')
    async bulkDeletedata(@Body('ids') ids: number[]) {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                return { status: false, message: `Please select categories for delete`, };
            }

            const deletedCount = await this.CategoryService.bulkDeletedata(ids);

            return { status: true, message: `${deletedCount} categories deleted successfully`, };
        } catch (error) {
            return { status: false, message: error.message, };
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

    @Patch('export')
    async exportListToXLSX(@Req() req, @Res() res) {
        try {
     
            const queryBuilder = this.CategoryModel.createQueryBuilder('category');
    
            
    
            // Include parent category details
            queryBuilder.leftJoinAndSelect('category.parent', 'parent');
    
            // Select fields
            queryBuilder.select([
                'category.id',
                'category.category_name',
                'category.ar_category_name',
                'category.provider_type',
                'category.category_img',
                'category.createdAt',
                'category.is_active',
                'parent.category_name',
                'parent.ar_category_name',
            ]);
    
            // Fetch data
            const data = await queryBuilder.getMany();
    
            // Map the data to include the required fields
            const exportedData = data.map((item: any) => ({
                "ID": item.id || '',
                "Category Name": item.category_name || '',
                "Arabic Category Name": item.ar_category_name || '',
                "Provider Type": item.provider_type || '',
                "Category Image": item.category_img || '',
                "Parent Category Name": item.parent?.category_name || '', // Parent category name
                "Parent Arabic Category Name": item.parent?.ar_category_name || '', // Parent Arabic category name
                "Created At": new Date(item.createdAt).toLocaleString(), // Format created date
                "Is Active": item.is_active ? 'Active' : 'Inactive', // Convert boolean to string
            }));
    
            // Create Excel sheet
            const ws = xlsx.utils.json_to_sheet(exportedData);
            const wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, ws, 'Category List');
    
            const buffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });
    
            // Set response headers
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=category_list_export.xlsx');
            res.setHeader('Content-Length', buffer.length.toString());
    
            return res.send(buffer);
        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    }


}
