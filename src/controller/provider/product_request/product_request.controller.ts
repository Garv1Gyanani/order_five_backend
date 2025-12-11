// src/template/template.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProductRequestService } from './product_request.service';
import { CommonMessages } from 'src/common/common-messages';
import { ProviderGuard } from 'src/authGuard/provider.guard';
import { OptionsMessage } from 'src/common/options';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/schema/user.schema';
import { Setting } from 'src/schema/setting.schema';
import { EmailTemplate } from 'src/schema/email_templates.schema';
import CommonService from 'src/common/common.util';
import { Product } from 'src/schema/product.schema';
import { ProductRequest } from 'src/schema/product_request.schema';

@Controller('/provider/productrequest')
@UseGuards(ProviderGuard)
export class ProductRequestController {
    constructor(
        private readonly ProductRequestService: ProductRequestService,
        @InjectRepository(User)
        private readonly UserModel: Repository<User>,
        @InjectRepository(Setting)
        private readonly SettingModel: Repository<Setting>,
        @InjectRepository(ProductRequest)
        private readonly ProductRequestModel: Repository<ProductRequest>,
        @InjectRepository(Product)
        private readonly ProductModel: Repository<Product>,
        @InjectRepository(EmailTemplate)
        private readonly EmailTemplateModel: Repository<EmailTemplate>,
    ) { }

    @Get('list')
    async getList(@Req() req: any) {
        try {
            let user_id = req.user.id
            const { page, size, s, status, cattype } = req.query;
            const data = await this.ProductRequestService.getAllPages(user_id, page, size, s, status, cattype);
            return { status: true, message: CommonMessages.GET_LIST('Product Request'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Get('get/:id')
    async getbyId(@Param('id') id: number) {
        try {
            const data = await this.ProductRequestService.getData(id);
            return { status: true, message: CommonMessages.GET_DATA('Product Request'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Post('createexist')
    async createdata(@Body() createDto: any, @Req() req) {
        try {
            let user_id = req.user.id;
            createDto.user_id = user_id;

            let existingRequest = await this.ProductRequestModel.findOne({ where: { user_id: user_id, product_id: createDto.product_id } });

            let productRequestData = {
                user_id: user_id,
                product_id: createDto.product_id,
                product_price: createDto.product_price,
                delievery_charge: createDto.delievery_charge,
                status: OptionsMessage.PRODUCT_STATUS.Approved
            };

            let data: any

            if (existingRequest) {
                // data = await this.ProductRequestService.updateData(existingRequest.id, productRequestData);
                return { status: false, message: 'Product already exist' };

            } else {
                data = await this.ProductRequestService.createData(productRequestData);
            }

            if (data) {
                const product = await this.ProductModel.findOne({ where: { id: createDto.product_id } });
                const adminuser = await this.UserModel.findOne({ where: { user_role: OptionsMessage.USER_ROLE.ADMIN } });
                const user = await this.UserModel.findOne({ where: { id: user_id } });
                if (adminuser) {
                    let smtpSettings = await this.SettingModel.find();
                    smtpSettings = JSON.parse(JSON.stringify(smtpSettings));
                    let template = await this.EmailTemplateModel.findOne({ where: { key: OptionsMessage.EMAIL_TEMPLATE.category_request } });
                    template = JSON.parse(JSON.stringify(template));

                    let email_data: any = { AdminName: adminuser.name, Username: user.name, ProductName: product.product_name, ProductDescription: product.description_name };
                    await CommonService.sendEmail(adminuser.email, email_data, template, smtpSettings);
                }
            }

            return { status: true, message: CommonMessages.created_data('Product Request'), data };
        } catch (error) {
            console.log(error);
            return { status: false, message: error.message };
        }
    }

    @Post('create')
    async createProfile(@Body() createDto: any, @Req() req) {
        try {
            let { local } = req.query
            if (local == OptionsMessage.LOCAL_TYPE.ARABIC) {
                createDto.ar_product_name = createDto.product_name
                createDto.ar_description_name = createDto.description_name
                delete createDto.product_name
                delete createDto.description_name
            }
            let user_id = req.user.id
            createDto.user_id = user_id
            let dataobj: any = {
                product_unit: createDto.product_unit,
                provider_type: createDto.provider_type,
                additional_info: createDto.additional_info,
                product_img: createDto.product_img,
                description_name: createDto.description_name,
                product_name: createDto.product_name,
                category_id: createDto.category_id,
                product_price: createDto.product_price,
                delievery_charge: createDto.delievery_charge,
                delievery_address: createDto.delievery_address,
                is_active: false,
            }
            if (local == OptionsMessage.LOCAL_TYPE.ARABIC) {
                dataobj.ar_product_name = dataobj.product_name
                dataobj.ar_description_name = dataobj.description_name
                delete dataobj.product_name
                delete dataobj.description_name
            }
            let newCategory: any = await this.ProductModel.create(dataobj);
            newCategory = await this.ProductModel.save(newCategory)

            let productreqedata = {
                user_id: user_id,
                product_id: newCategory.id,
                product_price: createDto.product_price,
                delievery_charge: createDto.delievery_charge,
                status: OptionsMessage.PRODUCT_STATUS.Requested
            }
            const data = await this.ProductRequestService.createData(productreqedata);

            if (data) {
                const adminuser = await this.UserModel.findOne({ where: { user_role: OptionsMessage.USER_ROLE.ADMIN } });
                const user = await this.UserModel.findOne({ where: { id: user_id } });
                if (adminuser) {
                    let smtpSettings = await this.SettingModel.find();
                    smtpSettings = JSON.parse(JSON.stringify(smtpSettings))
                    let template = await this.EmailTemplateModel.findOne({ where: { key: OptionsMessage.EMAIL_TEMPLATE.category_request } });
                    template = JSON.parse(JSON.stringify(template))

                    let email_data: any = { AdminName: adminuser.name, Username: user.name, ProductName: createDto.product_name, ProductDescription: createDto.description_name, }
                    await CommonService.sendEmail(adminuser.email, email_data, template, smtpSettings,);
                }
            }
            return { status: true, message: CommonMessages.created_data('Product Request'), data };
        } catch (error) {
            console.log(error)
            return { status: false, message: error.message };
        }
    }

    @Put('update/:id')
    async updateProfile(@Param('id') id: number, @Body() updateData: any, @Req() req) {
        try {
            let { local } = req.query
            if (local == OptionsMessage.LOCAL_TYPE.ARABIC) {
                updateData.ar_product_name = updateData.product_name
                updateData.ar_description_name = updateData.description_name
                delete updateData.product_name
                delete updateData.description_name
            }
            const response_data = await this.ProductRequestService.getDatabyid(id);
            if (!response_data) {
                return { status: false, message: CommonMessages.notFound('Product Request') };
            }
            const product_data = await this.ProductModel.findOne({ where: { id: response_data?.product_id } });
            if (!product_data) {
                return { status: false, message: CommonMessages.notFound('Product') };
            }

            let product_obj = {
                product_price: updateData.product_price,
                delievery_charge: updateData.delievery_charge,
                status: OptionsMessage.PRODUCT_STATUS.Approved,
            }
            await this.ProductRequestService.updateData(id, product_obj);

            delete updateData.delievery_charge
            delete updateData.product_price
            delete updateData.status
            let data = await this.ProductModel.update(response_data?.product_id, updateData);
            return { status: true, message: CommonMessages.updated_data('Product Request'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Delete('delete/:id')
    async deleteProfile(@Param('id') id: number) {
        try {
            await this.ProductRequestService.deleteData(id);
            return { status: true, message: CommonMessages.deleted_data('Product Request') };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Get('alllist')
    async getAllList(@Req() req: any) {
        try {

            const data = await this.ProductRequestService.getAll();
            return { status: true, message: CommonMessages.GET_LIST('Category'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

}
