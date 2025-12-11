// src/template/template.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CommonMessages } from 'src/common/common-messages';
import { ProviderGuard } from 'src/authGuard/provider.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UserGuard } from 'src/authGuard/user.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/schema/product.schema';
import { Like, Repository } from 'typeorm';
import { Category } from 'src/schema/category.schema';
import { ProductRequest } from 'src/schema/product_request.schema';
import { OptionsMessage } from 'src/common/options';
import { Notification } from 'src/schema/notification.schema';

@Controller('/customer')
@UseGuards(UserGuard)
export class CustomerController {
    constructor(
        private readonly customerService: CustomerService,
        @InjectRepository(Product)
        private readonly ProductModel: Repository<Product>,
        @InjectRepository(Category)
        private readonly CategoryModel: Repository<Category>,
        @InjectRepository(ProductRequest)
        private readonly ProductRequestModel: Repository<ProductRequest>,
        @InjectRepository(Notification)
        private readonly NotificationService: Repository<Notification>,
    ) { }


    // customer documents =============================
    @Get('getcustomerdocument/:id')
    async CustomerDocument(
        @Body() CustomerDocument: any,
        @Param('id') id: number
    ) {
        try {
            const data = await this.customerService.GetCustomerDocument(id);
            return { status: true, message: CommonMessages.upload_data('Document'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Post('uploaddocument')
    async uploaddocument(@Body() CustomerDocument: any) {
        try {
            const data = await this.customerService.createCustomerDocument(CustomerDocument);
            return { status: true, message: CommonMessages.upload_data('Document'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Put('updatecustomerdocument/:id')
    async UpdateCustomerDocument(
        @Body() CustomerDocument: any,
        @Param('id') id: number
    ) {
        try {
            const data = await this.customerService.UpdateCustomerDocument(id, CustomerDocument);
            return { status: true, message: CommonMessages.upload_data('Document'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    // get profile =============================
    @Get('profile')
    async getCustomerProfile(@Req() req: any) {
        try {
            const customer_id = req.user.id;
            const data = await this.customerService.getCustomerData(customer_id);
            return { status: true, message: CommonMessages.GET_DATA('Profile'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    // update profile =============================
    @Put('/profile/update/:id')
    async updateCustomerProfile(@Param('id') id: number, @Body() updateData: any) {
        try {
            const data = await this.customerService.updateCustomerData(id, updateData);
            return { status: true, message: CommonMessages.updated_data('Profile'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    /// uploadfile =============================
    @Post('/uploadfile')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, callback) => {
                const uniqueFilename = `${new Date().getTime()}-${file.originalname.replace(/ /g, "_")}`; // Generate unique filename
                callback(null, uniqueFilename);
            }
        })
    }))
    async uploadFiles(
        @UploadedFile() file,
    ) {
        try {
            let url = `${process.env.API_BASE_URL}${file.filename}`; // Use generated filename
            return { status: true, message: 'File uploaded successfully', url, data: file };
        } catch (error) {
            ;
            return { status: false, message: 'Error uploading file' };
        }
    }

 // @Get('globelsearch')
    // async GlobelSearch(@Req() req) {
    //     try {
    //         let { s } = req.query

    //         // Search query for products
    //         let product_query = { product_name: Like(`%${s}%`) };
    //         let product_data: any = await this.ProductModel.find({ where: product_query });
    //         product_data = JSON.parse(JSON.stringify(product_data));

    //         // Search query for categories
    //         let category_query = { category_name: Like(`%${s}%`) };
    //         let category_data = await this.CategoryModel.find({ where: category_query });

    //         // Fetch product request data
    //         let product_req_data: any = await this.ProductRequestModel.find({ where: { status: OptionsMessage.PRODUCT_STATUS.Approved } })
    //         product_req_data = JSON.parse(JSON.stringify(product_req_data));

    //         // Update product data with provider availability
    //         for (let element of product_data) {
    //             let product_data = product_req_data.filter((o) => o.product_id == element.id);
    //             element.provider_available = product_data.length || 0;
    //         }

    //         let random_category = await this.CategoryModel.createQueryBuilder()
    //             .orderBy('RAND()')
    //             .limit(5)
    //             .getMany();

    //         return { status: true, message: CommonMessages.upload_data('Document'), data: { product_data, category_data, random_category } };
    //     } catch (error) {
    //         return { status: false, message: error.message };
    //     }
    // }


    @Get('globelsearch')
    async GlobelSearch(@Req() req) {
        try {
            let { s } = req.query;
    
            // Search query for products
            let product_query = `(product.product_name LIKE :search COLLATE utf8mb4_general_ci 
                OR product.ar_product_name LIKE :search COLLATE utf8mb4_general_ci)`;
    
            let product_data: any = await this.ProductModel.createQueryBuilder('product')
                .where(product_query, { search: `%${s}%` })
                .getMany();
    
            product_data = JSON.parse(JSON.stringify(product_data));
 
    
            // Search query for categories
            let category_query = `(category.category_name LIKE :search COLLATE utf8mb4_general_ci 
                OR category.ar_category_name LIKE :search COLLATE utf8mb4_general_ci)`;
    
            let category_data: any = await this.CategoryModel.createQueryBuilder('category')
                .where(category_query, { search: `%${s}%` })
                .getMany();
    
            // Fetch product request data
            let product_req_data: any = await this.ProductRequestModel.find({
                where: { status: OptionsMessage.PRODUCT_STATUS.Approved },
            });
            product_req_data = JSON.parse(JSON.stringify(product_req_data));
    
            // Update product data with provider availability
            for (let element of product_data) {
                let provider_data = product_req_data.filter((o) => o.product_id == element.id);
                element.provider_available = provider_data.length || 0;
            }
    
            // Fetch random categories
            let random_category = await this.CategoryModel.createQueryBuilder()
                .orderBy('RAND()')
                .limit(5)
                .getMany();
    
            return {
                status: true,
                message: CommonMessages.upload_data('Document'),
                data: { product_data, category_data, random_category },
            };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }


    @Get('notification-list')
    async getAllNotificationPages(@Req() req: any) {
        try {
            const customer_id = req.user.id;

            const { page, size, s } = req.query;
            const data = await this.customerService.getAllNotificationPages( customer_id,page, size, s);
            return { status: true, message: CommonMessages.GET_LIST('notification'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

}
