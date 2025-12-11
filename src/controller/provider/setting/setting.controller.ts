// src/template/template.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { SettingService } from './setting.service';
import { CommonMessages } from 'src/common/common-messages';
import { ProviderGuard } from 'src/authGuard/provider.guard';

@Controller('/provider/setting')
@UseGuards(ProviderGuard)
export class SettingController {
    constructor(private readonly SettingService: SettingService) { }

    @Get('keylist')
    async getkeyList(@Req() req: any) {
        try {
            const { keys } = req.query;
            const keyArray = keys ? keys.split(',') : [];
            const data = await this.SettingService.getAllkeys(keyArray);
            return { status: true, message: CommonMessages.GET_LIST('Setting'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }
    
    @Get('list')
    async getList(@Req() req: any) {
        try {
            let { s } = req.query
            const data = await this.SettingService.getAllPages(s);
            return { status: true, message: CommonMessages.GET_LIST('Setting'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Get('get/:key')
    async getSettings(
        @Param('key') key,
    ) {
        try {
            const setting = await this.SettingService.getDatabyid(key);
            return { status: true, message: CommonMessages.updated_data('Setting'), data: setting };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Put('update')
    async updateSettings(@Req() req, @Body() body) {
        try {
            const { updated_data } = body;
            const results = [];

            for (const element of updated_data) {
                const updatedSetting = await this.SettingService.updateData(element.key, { value: element.value });
                results.push(updatedSetting);
            }

            return { status: true, message: CommonMessages.updated_data('Setting'), data: results };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

}
