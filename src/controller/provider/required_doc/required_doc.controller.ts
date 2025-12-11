// src/template/template.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { Required_docService } from './required_doc.service';
import { CommonMessages } from 'src/common/common-messages';
import { AdminGuard } from 'src/authGuard/admin.guard';
import { ProviderGuard } from 'src/authGuard/provider.guard';

@Controller('/provider/requireddoc')
@UseGuards(ProviderGuard)
export class Required_docController {
    constructor(private readonly Required_docService: Required_docService) { }

    @Get('list')
    async getRequired_docList(@Req() req: any) {
        try {
            const { page, size, s } = req.query;
            const data = await this.Required_docService.getAllPages(page, size, s);
            return { status: true, message: CommonMessages.GET_LIST('Provider'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Get('get/:id')
    async getRequired_docbyId(@Param('id') id: number) {
        try {
            const data = await this.Required_docService.getbyid(id);
            return { status: true, message: CommonMessages.GET_DATA('Provider'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

}
