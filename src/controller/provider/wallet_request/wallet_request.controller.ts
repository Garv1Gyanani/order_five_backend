// src/template/template.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { WalletRequestService } from './wallet_request.service';
import { CommonMessages } from 'src/common/common-messages';
import { ProviderGuard } from 'src/authGuard/provider.guard';
import { OptionsMessage } from 'src/common/options';
import { User } from 'src/schema/user.schema';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('/provider/walletrequest')
@UseGuards(ProviderGuard)
export class WalletRequestController {
    constructor(
        private readonly WalletRequestService: WalletRequestService,
        @InjectRepository(User)
        private readonly UserModel: Repository<User>,

    ) { }

    @Get('list')
    async getList(@Req() req: any) {
        try {
            const { page, size, s, status } = req.query;
            let user_id = req.user.id
            let data: any = await this.WalletRequestService.getAllPages(user_id, page, size, s, status);
            let user_data = await this.UserModel.findOne({ where: { id: user_id } })
            data.wallet_balance = user_data?.wallet_balance || 0
            return { status: true, message: CommonMessages.GET_LIST("Wallet Request"), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Get('get/:id')
    async getbyId(@Param('id') id: number) {
        try {
            const data = await this.WalletRequestService.getData(id);
            return { status: true, message: CommonMessages.GET_DATA("Wallet Request"), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Post('create')
    async createProfile(@Body() createDto: any, @Req() req: any) {
        try {
            let user_id = req.user.id
            createDto.amount_status = createDto.amount > 0 ? OptionsMessage.AMOUNT_STATUS.Credit : OptionsMessage.AMOUNT_STATUS.Debit
            createDto.user_type = OptionsMessage.WALLET_TYPE.Provider
            let userData = await this.UserModel.findOne({ where: { id: user_id } });
            if (!userData) {
                return { status: false, message: CommonMessages.notFound('User') };
            }
            if (Number(userData?.wallet_balance) < 1) {
                createDto.available_amount = Number(userData?.wallet_balance) || 0
            } else {
                let walletbalance = (Number(userData?.wallet_balance) || 0) + createDto.amount
                createDto.available_amount = walletbalance
            }
            const data = await this.WalletRequestService.createData(createDto);
            return { status: true, message: CommonMessages.created_data("Wallet Request"), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Put('update/:id')
    async updateProfile(@Param('id') id: number, @Body() updateData: any) {
        try {
            const data = await this.WalletRequestService.updateData(id, updateData);
            return { status: true, message: CommonMessages.updated_data("Wallet Request"), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Delete('delete/:id')
    async deleteProfile(@Param('id') id: number) {
        try {
            await this.WalletRequestService.deleteData(id);
            return { status: true, message: CommonMessages.deleted_data("Wallet Request") };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

}
