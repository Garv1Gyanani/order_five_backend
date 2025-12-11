// src/template/template.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Wallet_req } from 'src/schema/wallet_req.schema';
import * as bcrypt from 'bcrypt';
import CommonService from 'src/common/common.util';
import { CommonMessages } from 'src/common/common-messages';
import * as moment from 'moment-timezone';

@Injectable()
export class WalletRequestService {
    constructor(
        @InjectRepository(Wallet_req)
        private readonly WalletRequestModel: Repository<Wallet_req>,
    ) { }

    async getAllPages(user_id: any, page: number = 1, pageSize: number = 10, search: string = '', status: string) {
        try {
            const { limit, offset } = CommonService.getPagination(page, pageSize);

            const whereCondition: any = { user_id: user_id };

            if (status) {
                whereCondition.status = status;
            }

            if (search) {
                whereCondition.user = {
                    name: Like(`%${search}%`),
                    phone_num: Like(`%${search}%`)
                };
            }

            // Find and count the records with pagination, join, and conditions
            const [pages, count] = await this.WalletRequestModel.findAndCount({
                where: whereCondition,
                relations: ['user'], // Join with User entity to get user details
                skip: offset,
                take: limit,
                select: {
                    user: { name: true, phone_num: true, user_role: true } // Select specific fields from User
                },
                order: { createdAt: 'DESC' }
            });

            // Format paginated data
            const paginatedData = CommonService.getPagingData({ count, rows: pages }, page, limit);
            return paginatedData;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Get WalletRequest data
    async getData(id: number) {
        try {
            const WalletRequest = await this.WalletRequestModel.findOne({ where: { id: id } });

            if (!WalletRequest) {
                throw new Error(CommonMessages.notFound("Wallet request"));
            }
            return WalletRequest;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Get WalletRequest data by ID
    async getDatabyid(id: number) {
        try {
            const WalletRequest = await this.WalletRequestModel.findOne({ where: { id: id } });

            if (!WalletRequest) {
                throw new Error(CommonMessages.notFound("Wallet request"));
            }

            return WalletRequest;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Create WalletRequest data
    async createData(data: any) {
        try {
            data.createdAt = moment.tz('Asia/Riyadh').format('YYYY-MM-DD HH:mm:ss'); // Adding createdAt

            if (data.transaction_id) { } else {
                let transaction_id = CommonService.createTransactionId()
                data.transaction_id = transaction_id
            }
            let newWalletRequest: any = await this.WalletRequestModel.create(data);
            newWalletRequest = await this.WalletRequestModel.save(newWalletRequest)
            return newWalletRequest;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Update WalletRequest data
    async updateData(id: number, updateData: any) {
        try {
            let response = await this.WalletRequestModel.update(id, updateData);
            if (response[0] === 0) {
                throw new Error("No WalletRequest data was updated.");
            }
            return response
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Delete WalletRequest data
    async deleteData(id: number) {
        try {
            const WalletRequest = await this.WalletRequestModel.findOne({ where: { id: id } });

            if (!WalletRequest) {
                throw new Error(CommonMessages.notFound("Wallet request"));
            }

            await this.WalletRequestModel.softDelete(id);
            return WalletRequest;
        } catch (error) {
            throw new Error(error.message);
        }
    }

}
