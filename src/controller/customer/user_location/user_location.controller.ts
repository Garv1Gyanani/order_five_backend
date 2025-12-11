// src/template/template.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserLocationService } from './user_location.service'
import { CommonMessages } from 'src/common/common-messages';
import { UserGuard } from 'src/authGuard/user.guard';

@Controller('/customer/userlocation')
@UseGuards(UserGuard)
export class UserLocationController {
    constructor(private readonly UserLocationService: UserLocationService) { }

    @Get('list')
    async getList(@Req() req: any) {
        try {
            const { page, size, s } = req.query;
            let user_id = req.user.id
            const data = await this.UserLocationService.getAllPages(user_id, page, size, s);
            return { status: true, message: CommonMessages.GET_LIST("Address"), data };
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
            let user_id = req.user.id
            createDto.user_id = user_id
            const data = await this.UserLocationService.createData(createDto);
            return { status: true, message: CommonMessages.created_data("Address"), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Put('update/:id')
    async updateProfile(@Param('id') id: number, @Body() updateData: any) {
        try {
            const updatedRecord = await this.UserLocationService.updateData(id, updateData);
    
            return { status: true, message: CommonMessages.updated_data("Address"), data: updatedRecord };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }
    

    @Delete('delete/:id')
    async deleteProfile(@Param('id') id: number) {
        try {
            await this.UserLocationService.deleteData(id);
            return { status: true, message: CommonMessages.deleted_data("Address") };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

}
