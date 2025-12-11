// src/template/template.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { Required_docService } from './required_doc.service';
import { CommonMessages } from 'src/common/common-messages';
import { AdminGuard } from 'src/authGuard/admin.guard';
import { OptionsMessage } from 'src/common/options';
import { title } from 'process';

@Controller('/requireddoc')
@UseGuards(AdminGuard)
export class Required_docController {
    constructor(private readonly Required_docService: Required_docService) { }

    @Get('list')
    async getRequired_docList(@Req() req: any) {
        try {
            const { page, size, s, is_active } = req.query;
            const data = await this.Required_docService.getAllPages(page, size, s, is_active);
            return { status: true, message: CommonMessages.GET_LIST('Document'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Get('alllist')
    async getAllRequireddocList(@Req() req: any) {
        try {
            const data = await this.Required_docService.getList();
            return { status: true, message: CommonMessages.GET_LIST('Document'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Get('get/:id')
    async getRequired_docbyId(@Param('id') id: number) {
        try {
            const data = await this.Required_docService.getbyid(id);
            return { status: true, message: CommonMessages.GET_DATA('Document'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }
    

    @Post('create')
    async createdata(@Req() req, @Body() createRequired_docDto: any) {
        try {
            // let { local } = req.query
            // if (local == OptionsMessage.LOCAL_TYPE.ARABIC) {
            //     createRequired_docDto.ar_title = createRequired_docDto.title
            //     delete createRequired_docDto.title
            // }
            const data = await this.Required_docService.createData(createRequired_docDto);
            return { status: true, message: CommonMessages.created_data('Document'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Put('update/:id')
    async updatedata(@Req() req, @Param('id') id: number, @Body() updateData: any) {
        try {
            // If `custom_fields` is passed, ensure it is in JSON format
            if (updateData.custom_fields && typeof updateData.custom_fields !== 'string') {
                updateData.custom_fields = JSON.stringify(updateData.custom_fields);
            }
    
            const data = await this.Required_docService.updateData(id, updateData);
            return { status: true, message: CommonMessages.updated_data('Document'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }
    

    @Delete('delete/:id')
    async deletedata(@Param('id') id: number) {
        try {
            await this.Required_docService.deleteData(id);
            return { status: true, message: CommonMessages.deleted_data('Document') };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Delete('bulkdelete')
    async bulkDeletedata(@Body('ids') ids: number[]) {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                return { status: false, message: `Please select required document for delete`, };
            }

            const deletedCount = await this.Required_docService.bulkDeletedata(ids);

            return { status: true, message: `${deletedCount} required document deleted successfully`, };
        } catch (error) {
            return { status: false, message: error.message, };
        }
    }
}
