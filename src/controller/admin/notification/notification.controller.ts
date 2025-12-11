// src/template/template.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CommonMessages } from 'src/common/common-messages';
import { UserGuard } from 'src/authGuard/user.guard';
import { Notification } from 'src/schema/notification.schema';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminGuard } from 'src/authGuard/admin.guard';

@Controller('/admin/notification')
@UseGuards(AdminGuard)
export class NotificationController {


    constructor(
        private readonly NotificationService: NotificationService,
        @InjectRepository(Notification)
        private readonly Notification: Repository<Notification>,

    ) { }


    @Post('create')
    async createNotification(@Body() createDto: any) {
        try {
            const payload = {
                title: createDto.title,
                description: createDto.description,
                image: createDto.image,
                user_type: createDto.user_type,
            };
    
            await this.NotificationService.sendPushNotification(payload);
    
            return { status: true, message: 'Notification sent successfully!' };
        } catch (error) {
            console.error('Error creating notification:', error.message || error);
            return { status: false, message: error.message };
        }
    }
    

    @Get('list')
    async getList(@Req() req: any) {
        try {
            const { page, size, s } = req.query;
            const data = await this.NotificationService.getAllPages(page, size, s);
            return { status: true, message: CommonMessages.GET_LIST('notification'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }
}

