// src/template/template.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ReportService } from './report.service';
import { CommonMessages } from 'src/common/common-messages';
import { AdminGuard } from 'src/authGuard/admin.guard';
import * as xlsx from 'xlsx';
import { OptionsMessage } from 'src/common/options';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Like, Repository } from 'typeorm';
import { Report } from 'src/schema/report.schema';
import { Wallet_req } from 'src/schema/wallet_req.schema';
import { User } from 'src/schema/user.schema';
import CommonService from 'src/common/common.util';

@Controller('/report')
@UseGuards(AdminGuard)
export class ReportController {
    constructor(
        private readonly ReportService: ReportService,
        @InjectRepository(Wallet_req)
        private readonly Wallet_req: Repository<Wallet_req>,
        @InjectRepository(User)
        private readonly User: Repository<User>,
    ) { }

    @Get('list')
    async getList(@Req() req: any) {
        try {
            const { page, size, s } = req.query;
            const data = await this.ReportService.getAllPages(page, size, s);
            return { status: true, message: CommonMessages.GET_LIST('Subscription'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Put('block-user/:id')
    async updatedata(@Req() req, @Param('id') id: number, @Body() updateData: any) {
        try {
            const { block_day , is_pr_block } = updateData; // Extract block_day from request body



            const data = await this.ReportService.updateData(id, block_day ,is_pr_block);
            return { status: true, message: 'User block successful', data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Get('getreportcounts')
    async getreportcounts(@Req() req: any) {
        try {
            const { start_date, end_date } = req.query; // Extract start_date and end_date from query params

            let whereConditions = {

            };

            // Add date filter if provided
            if (start_date && end_date) {
                whereConditions['createdAt'] = Between(new Date(start_date), new Date(end_date));
            }


            const records = await this.Wallet_req.find({
                where: {
                    ...whereConditions,
                    status: In([OptionsMessage.WALLET_STATUS.Approved, 'Accepted']),
                },
            });


            // Count the number of requests with date filter
            const offlineCount = await this.Wallet_req.count({
                where: { ...whereConditions, status: OptionsMessage.WALLET_STATUS.Approved, wallet_type: 'Offline' },
            });
            const onlineCount = await this.Wallet_req.count({
                where: { ...whereConditions, status: OptionsMessage.WALLET_STATUS.Approved, wallet_type: 'Online' },
            });
            const subscriptionCount = await this.Wallet_req.count({
                where: { ...whereConditions, status: 'Accepted', order_type: 'Subscription' },
            });
            const costPerOrderCount = await this.Wallet_req.count({
                where: { ...whereConditions, status: OptionsMessage.WALLET_STATUS.Approved, order_type: 'order' },
            });

            const unusedBalance = await this.User.count({})

            // Sum the amounts for each category using QueryBuilder and date filter
            const offlineSum = await this.Wallet_req.createQueryBuilder('wallet')
                .select('SUM(wallet.amount)', 'sum')
                .where('wallet.status = :status', { status: OptionsMessage.WALLET_STATUS.Approved })
                .andWhere('wallet.wallet_type = :type', { type: 'Offline' })
                .andWhere(whereConditions)
                .getRawOne();

            const onlineSum = await this.Wallet_req.createQueryBuilder('wallet')
                .select('SUM(wallet.amount)', 'sum')
                .where('wallet.status = :status', { status: OptionsMessage.WALLET_STATUS.Approved })
                .andWhere('wallet.wallet_type = :type', { type: 'Online' })
                .andWhere(whereConditions)
                .getRawOne();

            const subscriptionSum = await this.Wallet_req.createQueryBuilder('wallet')
                .select('SUM(wallet.amount)', 'sum')
                .where('wallet.status = :status', { status: 'Accepted' })
                .andWhere('wallet.order_type = :type', { type: 'Subscription' })
                .andWhere(whereConditions)
                .getRawOne();

            const costPerOrderSum = await this.Wallet_req.createQueryBuilder('wallet')
                .select('SUM(wallet.amount)', 'sum')
                .where('wallet.status = :status', { status: OptionsMessage.WALLET_STATUS.Approved })
                .andWhere('wallet.order_type = :type', { type: 'order' })
                .andWhere(whereConditions)
                .getRawOne();

            const unUsedBalance = await this.User.createQueryBuilder('wallet')
                .select('SUM(wallet.wallet_balance)', 'sum')
                .getRawOne();

            // Response with the counts and sums
            const response = {
                offline: {
                    count: offlineCount,
                    totalAmount: offlineSum.sum || 0,
                },
                online: {
                    count: onlineCount,
                    totalAmount: onlineSum.sum || 0,
                },
                subscription: {
                    count: subscriptionCount,
                    totalAmount: subscriptionSum.sum || 0,
                },
                costPerOrder: {
                    count: costPerOrderCount,
                    totalAmount: costPerOrderSum.sum || 0,
                },
                unUsedBalance: {
                    totalAmount: unUsedBalance.sum || 0,
                    count: unusedBalance,
                },

            };

            return { status: true, message: CommonMessages.GET_LIST('Dashboard'), data: response };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }


    @Get('income-report-list')
    async IncomeReport(@Req() req: any) {
        try {
            const { page = 1, size = 10, start_date, end_date, s, user_type, wallet_type } = req.query;
    
            let whereConditions = {};
    
            // Filter by date range
            if (start_date && end_date) {
                whereConditions['createdAt'] = Between(new Date(start_date), new Date(end_date));
            }
    
            // Filter by user type
            if (user_type) {
                whereConditions['user_type'] = Like(`%${user_type}%`);
            }
    
            // Filter by wallet type
            if (wallet_type) {
                whereConditions['wallet_type'] = Like(`%${wallet_type}%`);
            }
    
            const { limit, offset } = CommonService.getPagination(page, size);
    
            const [records, totalCount] = await this.Wallet_req.findAndCount({
                where: {
                    ...whereConditions,
                    status: In([OptionsMessage.WALLET_STATUS.Approved, 'Accepted']),
                },
                skip: offset,
                take: limit,
                order: { createdAt: 'DESC' },
            });
    
            // Fetch user details and apply search keyword
            const enrichedRecords = await Promise.all(
                records.map(async (record) => {
                    const user = await this.User.findOne({
                        where: {
                            id: record.user_id,
                            ...(s ? { name: Like(`%${s}%`) } : {}), // Apply search condition if "s" is provided
                        },
                    });
    
                    return {
                        ...record,
                        user: user
                            ? { name: user.name, phone_num: user.phone_num, image_url: user.image_url }
                            : { name: null, phone_num: null, image_url: null },
                    };
                })
            );
    
            const response = {
                data: {
                    totalItems: totalCount,
                    data: enrichedRecords.filter((record) => record.user.name !== null), // Filter only matching users
                    totalPages: Math.ceil(totalCount / size),
                    currentPage: Number(page),
                },
            };
    
            return { status: true, message: CommonMessages.GET_LIST('income report'), data: response };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }
    


    @Patch('export-income-report')
    async exportIncomeReport(@Req() req, @Res() res) {
        try {
            const { start_date, end_date } = req.query;

            let whereConditions: any = {};

            // Apply date range filter if `start_date` and `end_date` are provided
            if (start_date && end_date) {
                whereConditions['createdAt'] = Between(new Date(start_date), new Date(end_date));
            }



            // Fetch the filtered data
            const data = await this.Wallet_req.find({
                where: {
                    ...whereConditions,
                    status: In([OptionsMessage.WALLET_STATUS.Approved, 'Accepted']),
                },
                order: { createdAt: 'DESC' },
            });

            // Fetch user details for each record
            const enrichedData = await Promise.all(
                data.map(async (record) => {
                    const user = await this.User.findOne({ where: { id: record.user_id } });
                    return {
                        ...record,
                        user: user
                            ? { name: user.name, phone_num: user.phone_num }
                            : { name: null, phone_num: null },
                    };
                })
            );

            // Format data for Excel export
            const exportedData = enrichedData.map((item: any) => ({
                "Transaction ID": item.transaction_id || '',
                "User Name": item.user?.name || '',
                "Phone Number": item.user?.phone_num || '',
                "User Type": item.user_type || '',
                "Wallet Type": item.wallet_type || '',
                "Amount": item.amount || '',
                "Currency": 'YER',
                "Remark": item.remark || '',
                "Order Type": item.order_type || '',
                "Status": item.status || '',
                "Date": new Date(item.createdAt).toLocaleString(),
            }));

            // Create and write Excel file
            const ws = xlsx.utils.json_to_sheet(exportedData);
            const wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, ws, 'Income Report');

            const buffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });

            // Set headers for file download
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=income_report.xlsx');
            res.setHeader('Content-Length', buffer.length.toString());

            return res.send(buffer);
        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    }

}
