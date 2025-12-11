// src/template/template.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CategoryRequestService } from './category_request.service';
import { CommonMessages } from 'src/common/common-messages';
import { ProviderGuard } from 'src/authGuard/provider.guard';
import CommonService from 'src/common/common.util';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryRequest } from 'src/schema/category_request.schema';
import { Repository } from 'typeorm';
import { User } from 'src/schema/user.schema';
import { Setting } from 'src/schema/setting.schema';
import { EmailTemplate } from 'src/schema/email_templates.schema';
import { OptionsMessage } from 'src/common/options';

@Controller('/provider/categoryrequest')
@UseGuards(ProviderGuard)
export class CategoryRequestController {
    constructor(
        private readonly CategoryReqService: CategoryRequestService,
        @InjectRepository(User)
        private readonly UserModel: Repository<User>,
        @InjectRepository(Setting)
        private readonly SettingModel: Repository<Setting>,
        @InjectRepository(EmailTemplate)
        private readonly EmailTemplateModel: Repository<EmailTemplate>,
    ) { }

    @Get('list')
    async getList(@Req() req: any) {
        try {
            const { page, size, s, status, cattype } = req.query;
            const data = await this.CategoryReqService.getAllPages(page, size, s, status, cattype);
            return { status: true, message: CommonMessages.GET_LIST('CategoryRequest'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Get('get/:id')
    async getbyId(@Param('id') id: number) {
        try {
            const data = await this.CategoryReqService.getData(id);
            return { status: true, message: CommonMessages.GET_DATA('CategoryRequest'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Post('create')
    async createProfile(@Body() createDto: any, @Req() req) {
        try {
            let { local } = req.query
            if (local == OptionsMessage.LOCAL_TYPE.ARABIC) {
                createDto.ar_category_name = createDto.category_name
                delete createDto.category_name
            }
            let user_id = req.user.id
            createDto.user_id = user_id
            const data = await this.CategoryReqService.createData(createDto);
            // send mail ================================================
            if (data) {
                const adminuser = await this.UserModel.findOne({ where: { user_role: OptionsMessage.USER_ROLE.ADMIN } });
                const user = await this.UserModel.findOne({ where: { id: user_id } });
                if (adminuser) {
                    let smtpSettings = await this.SettingModel.find();
                    smtpSettings = JSON.parse(JSON.stringify(smtpSettings))
                    let template = await this.EmailTemplateModel.findOne({ where: { key: OptionsMessage.EMAIL_TEMPLATE.category_request } });
                    template = JSON.parse(JSON.stringify(template))

                    let email_data: any = { AdminName: adminuser.name, Username: user.name, CategoryName: createDto.category_name }
                    await CommonService.sendEmail(adminuser.email, email_data, template, smtpSettings,);
                }
            }
            return { status: true, message: CommonMessages.created_data('CategoryRequest'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Put('update/:id')
    async updateProfile(@Req() req, @Param('id') id: number, @Body() updateData: any) {
        try {
            let { local } = req.query
            if (local == OptionsMessage.LOCAL_TYPE.ARABIC) {
                updateData.ar_category_name = updateData.category_name
                delete updateData.category_name
            }
            const data = await this.CategoryReqService.updateData(id, updateData);
            return { status: true, message: CommonMessages.updated_data('CategoryRequest'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Delete('delete/:id')
    async deleteProfile(@Param('id') id: number) {
        try {
            await this.CategoryReqService.deleteData(id);
            return { status: true, message: CommonMessages.deleted_data('CategoryRequest') };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Get('alllist')
    async getAllList(@Req() req: any) {
        try {

            const data = await this.CategoryReqService.getAll();
            return { status: true, message: CommonMessages.GET_LIST('Category'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

}
