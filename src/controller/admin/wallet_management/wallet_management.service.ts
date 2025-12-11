import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { Wallet_req } from 'src/schema/wallet_req.schema';
import CommonService from 'src/common/common.util';
import { CommonMessages } from 'src/common/common-messages';
import * as moment from 'moment-timezone';

@Injectable()
export class WalletManagementService {
    constructor(
        @InjectRepository(Wallet_req)
        private readonly WalletManagementModel: Repository<Wallet_req>,
    ) { }

    async getAllPages(page: number = 1, pageSize: number = 10, search: string = '', status: string) {
        try {
            const { limit, offset } = CommonService.getPagination(page, pageSize);

            const whereCondition: any = {};

            if (status) {
                whereCondition.status = status;
            }

            if (search) {
                whereCondition.user = { name: Like(`%${search}%`) };
            }

            // Find and count the records with pagination, join, and conditions
            const [pages, count] = await this.WalletManagementModel.findAndCount({
                where: whereCondition,
                relations: ['user'], // Join with User entity to get user details
                skip: offset,
                take: limit,
                select: {
                    user: { name: true, phone_num: true, user_role: true } // Select specific fields from User
                },
                order: { id: 'DESC' }
            });

            // Format paginated data
            const paginatedData = CommonService.getPagingData({ count, rows: pages }, page, limit);
            return paginatedData;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async getUserAllPages(user_id: any, page: number = 1, pageSize: number = 10, search: string = '', status: string) {
        try {
            const { limit, offset } = CommonService.getPagination(page, pageSize);

            const whereCondition: any = { user_id };

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
            const [pages, count] = await this.WalletManagementModel.findAndCount({
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

    // Get WalletManagement data
    async getData(id: number) {
        try {
            const WalletManagement = await this.WalletManagementModel.findOne({ where: { id: id } });

            if (!WalletManagement) {
                throw new Error(CommonMessages.notFound("Wallet request"));
            }
            return WalletManagement;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Get WalletManagement data by ID
    async getDatabyid(id: number) {
        try {
            const WalletManagement = await this.WalletManagementModel.findOne({ where: { id: id } });

            if (!WalletManagement) {
                throw new Error(CommonMessages.notFound("Wallet request"));
            }

            return WalletManagement;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Create WalletManagement data
    // async createData(data: any) {
    //     try {
    //         if (data.transaction_id) { } else {
    //             let transaction_id = CommonService.createTransactionId()
    //             data.transaction_id = transaction_id
    //         }
    //         let newWalletManagement: any = await this.WalletManagementModel.create(data);
    //         newWalletManagement = await this.WalletManagementModel.save(newWalletManagement)
    //         return newWalletManagement;
    //     } catch (error) {
    //         throw new Error(error.message);
    //     }
    // }

    async createData(data: any) {
        try {
            // Ensure `transaction_id` is set if not provided
            if (!data.transaction_id) {
                let transaction_id = CommonService.createTransactionId();
                data.transaction_id = transaction_id;
            }
    
            // Set the createdAt field to the current time in Saudi Arabia (Riyadh) timezone (GMT+3)
            data.createdAt = moment.tz('Asia/Riyadh').format('YYYY-MM-DD HH:mm:ss');
    
            // Create a new wallet management record with the adjusted time
            let newWalletManagement: any = await this.WalletManagementModel.create(data);
            newWalletManagement = await this.WalletManagementModel.save(newWalletManagement);
    
            return newWalletManagement;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    
    // Update WalletManagement data
    async updateData(id: number, updateData: any) {
        try {
            let response = await this.WalletManagementModel.update(id, updateData);
            if (response[0] === 0) {
                throw new Error("No WalletManagement data was updated.");
            }
            return response
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Delete WalletManagement data
    async deleteData(id: number) {
        try {
            const WalletManagement = await this.WalletManagementModel.findOne({ where: { id: id } });

            if (!WalletManagement) {
                throw new Error(CommonMessages.notFound("Wallet request"));
            }

            await this.WalletManagementModel.softDelete(id);
            return WalletManagement;
        } catch (error) {
            throw new Error(error.message);
        }
    }


    async bulkDeletedata(ids: number[]): Promise<number> {
        try {
            const categories = await this.WalletManagementModel.find({ where: { id: In(ids) } });

            if (categories.length === 0) {
                throw new Error(CommonMessages.notFound('wallet request'));
            }

            const result = await this.WalletManagementModel.softDelete(ids);

            return result.affected || 0;
        } catch (error) {
            throw new Error(error.message);
        }
    }


}
