// src/template/template.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CommonMessages } from 'src/common/common-messages';
import { AdminGuard } from 'src/authGuard/admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('/subscription')
@UseGuards(AdminGuard)
export class SubscriptionController {
    constructor(private readonly SubscriptionService: SubscriptionService) { }

    @Get('list')
    async getList(@Req() req: any) {
        try {
            const { page, size, s } = req.query;
            const data = await this.SubscriptionService.getAllPages(page, size, s);
            return { status: true, message: CommonMessages.GET_LIST('Subscription'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Get('get/:id')
    async getbyId(@Param('id') id: number) {
        try {
            const data = await this.SubscriptionService.getData(id);
            return { status: true, message: CommonMessages.GET_DATA('Subscription'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Get('userget/:id')
    async getDataByUserId(@Param('id') id: number) {
        try {
            const data = await this.SubscriptionService.getDataByUserId(id);
            return { status: true, message: CommonMessages.GET_DATA('Subscription details'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Post('create')
    async createdata(@Body() createDto: any) {
        try {
            const data = await this.SubscriptionService.createData(createDto);
            return { status: true, message: CommonMessages.created_data('Subscription'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Put('update/:id')
    async updatedata(@Param('id') id: number, @Body() updateData: any) {
        try {
            const data = await this.SubscriptionService.updateData(id, updateData);
            return { status: true, message: CommonMessages.updated_data('Subscription'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Delete('delete/:id')
    async deletedata(@Param('id') id: number) {
        try {
            await this.SubscriptionService.deleteData(id);
            return { status: true, message: CommonMessages.deleted_data('Subscription') };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Delete('/bulkdelete')
    async bulkDeletedata(@Body('ids') ids: number[]) {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                return { status: false, message: `Please select Subscription for delete`, };
            }

            const deletedCount = await this.SubscriptionService.bulkDeletedata(ids);

            return { status: true, message: `${deletedCount} subscription deleted successfully`, };
        } catch (error) {
            return { status: false, message: error.message, };
        }
    }


    @Get('subscriber-list')
    async getsubscriberList(@Req() req: any) {
        try {
            const { page, size, s ,status } = req.query;
            const data = await this.SubscriptionService.getsubscriberList(page, size, s ,status);
            // Return the response directly 
            return data;
        } catch (error) {
            return { status: false, message: error.message };
        }
    }
    
}
