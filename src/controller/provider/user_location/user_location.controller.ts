// src/template/template.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserLocationService } from './user_location.service'
import { CommonMessages } from 'src/common/common-messages';
import { ProviderGuard } from 'src/authGuard/provider.guard';

@Controller('/provider/userlocation')
@UseGuards(ProviderGuard)
export class UserLocationController {
    constructor(private readonly UserLocationService: UserLocationService) { }

    @Get('list')
    async getList(@Req() req: any) {
        try {
            let user_id = req.user.id
            const data = await this.UserLocationService.getAllPages(user_id);
            return { status: true, message: CommonMessages.GET_LIST("Address"), data:data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Get('get/:id')
    async getbyId(@Param('id') id: number) {
        try {
            const data = await this.UserLocationService.getData(id);
            return { status: true, message: CommonMessages.GET_DATA("Address"), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Post('create')
    async createProfile(@Body() createDto: any, @Req() req: any) {
        try {
            let user_id = req.user.id;
            createDto.user_id = user_id;
            
             const data = await this.UserLocationService.createOrUpdateData(createDto, user_id);
    
            return { status: true, message: 'user location added successfull', data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }



     

}
