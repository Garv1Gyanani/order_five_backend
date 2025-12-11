// src/template/template.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProductRequestService } from './product_request.service';
import { CommonMessages } from 'src/common/common-messages';
import { AdminGuard } from 'src/authGuard/admin.guard';
import { OptionsMessage } from 'src/common/options';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Product } from 'src/schema/product.schema';
import * as xlsx from 'xlsx';
import { ProductRequest } from 'src/schema/product_request.schema';
import { UserGuard } from 'src/authGuard/user.guard';

@Controller('/customer/productrequest')
@UseGuards(UserGuard)
export class ProductRequestController {
    constructor(
        private readonly ProductRequestService: ProductRequestService,
        @InjectRepository(Product)
        private readonly ProductModel: Repository<Product>,
        @InjectRepository(ProductRequest)
        private readonly ProductRequestModel: Repository<ProductRequest>,
    ) { }

    @Get('list')
    async getList(@Req() req: any) {
        try {
            const { page, size, s, status, category_id } = req.query;
            const data = await this.ProductRequestService.getAllPages(page, size, s, status, category_id);
            return { status: true, message: CommonMessages.GET_LIST('ProductRequest'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Get('get/:id')
    async getbyId(@Param('id') id: number) {
        try {
            const data = await this.ProductRequestService.getData(id);
            return { status: true, message: CommonMessages.GET_DATA('ProductRequest'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Post('create')
    async createProfile(@Body() createDto: any, @Req() req) {
        try {

            let dataobj: any = {
                description_name: createDto.description_name,
                ar_description_name: createDto.ar_description_name,
                product_unit: createDto.product_unit,
                provider_type: createDto.provider_type,
                product_name: createDto.product_name,
                additional_info: createDto.additional_info,
                product_img: createDto.product_img,
                ar_product_name: createDto.ar_product_name,
                category_id: createDto.category_id,
                product_price: createDto.product_price,
                delievery_charge: createDto.delievery_charge,
                delievery_address: createDto.delievery_address,
                is_active: false,
            }
            let newCategory: any = await this.ProductModel.create(dataobj);
            newCategory = await this.ProductModel.save(newCategory)

            let productreqedata = {
                user_id: createDto.user_id,
                product_id: newCategory.id,
                product_price: createDto.product_price,
                delievery_charge: createDto.delievery_charge,
                status: OptionsMessage.PRODUCT_STATUS.Approved
            }
            const data = await this.ProductRequestService.createData(productreqedata);

            return { status: true, message: CommonMessages.created_data('ProductRequest'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Put('update/:id')
    async updateProfile2(@Param('id') id: number, @Body() updateData: any) {
        try {
            let product_obj = {
                product_price: updateData.product_price,
                delievery_charge: updateData.delievery_charge,
                status: OptionsMessage.PRODUCT_STATUS.Requested,
            }
            const data = await this.ProductRequestService.updateData(id, product_obj);
            const response_data = await this.ProductRequestService.getDatabyid(id);
            if (!response_data) {
                return { status: false, message: CommonMessages.notFound('Product Request') };
            }
            const product_data = await this.ProductModel.findOne({ where: { id: response_data?.product_id } });
            if (!product_data) {
                return { status: false, message: CommonMessages.notFound('Product') };
            }
            if (response_data && updateData.status == OptionsMessage.PRODUCT_STATUS.Approved) {
                let obj: any = { is_active: true }
                await this.ProductModel.update(response_data.product_id, obj);
            }
            delete updateData.status
            delete updateData.delievery_charge
            delete updateData.product_price
            let Productdata = await this.ProductModel.update(response_data?.product_id, updateData);
            return { status: true, message: CommonMessages.updated_data('Product Request'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Delete('delete/:id')
    async deleteProfile(@Param('id') id: number) {
        try {
            await this.ProductRequestService.deleteData(id);
            return { status: true, message: CommonMessages.deleted_data('ProductRequest') };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Patch('export')
    async exportListToXLSX(@Req() req, @Res() res) {
        try {
            let { s, status } = req.query;

            const whereCondition: any = {};
            if (status) {
                whereCondition.status = status;
            }
            if (s) {
                whereCondition.user = { name: Like(`%${s}%`) };
            }

            const data = await this.ProductRequestModel.find({
                where: whereCondition,
                relations: ['user', 'product'],
                select: {
                    user: { name: true },
                },
                order: { createdAt: 'DESC' },
            });

            // Format the data for Excel export
            const exportedData = data.map((item: any) => ({
                "ID": item?.id || '',
                "Provider Type": item?.product?.provider_type || '',
                "Product Name": item?.product?.product_name || '',
                "Additional Info": item?.product?.additional_info || '',
                "Arabic Product Name": item?.product?.ar_product_name || '',
                "Description": item?.product?.description_name || '',
                "Arabic Description": item?.product?.ar_description_name || '',
                "Product Image": item?.product?.product_img || '',
                "Product Unit": item?.product?.product_unit || '',
                "Product Price": item?.product?.product_price || '',
                "Delievery Charge": item?.product?.delievery_charge || '',
                // "Category ID": item?.product?.category_id || '',
                "Is Active": item?.is_active ? 'Active' : 'Inactive',
                // "Created At": new Date(item?.createdAt).toLocaleString(),
                "Created At": new Date(item?.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }),

                // "Updated At": new Date(item?.updatedAt).toLocaleString(),
            }));

            const ws = xlsx.utils.json_to_sheet(exportedData);
            const wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, ws, 'Product List');

            const buffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=product_list_export.xlsx');
            res.setHeader('Content-Length', buffer.length.toString());

            return res.send(buffer);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, message: error.message });
        }
    }

}
