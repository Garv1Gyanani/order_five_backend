// src/template/template.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import CommonService from 'src/common/common.util';
import { OptionsMessage } from 'src/common/options';
import { CommonMessages } from 'src/common/common-messages';
import * as moment from 'moment-timezone';
import { Report } from 'src/schema/report.schema';
import { User } from 'src/schema/user.schema';


@Injectable()
export class ReportService {
    constructor(
        @InjectRepository(Report)
        private readonly ReportModel: Repository<Report>,
        @InjectRepository(User)
        private readonly UserModel: Repository<User>,
    ) { }

    async getAllPages(page: number = 1, pageSize: number = 10, search: string = '') {
        try {
            const { limit, offset } = CommonService.getPagination(page, pageSize);

            const [pages, count] = await this.ReportModel.findAndCount({
                skip: offset,
                take: limit,
                order: { createdAt: 'DESC' },
            });

            const reportsWithUserData = await Promise.all(
                pages.map(async (report) => {
                    const user = await this.UserModel.findOne({
                        where: { id: report.user_id },
                    });
                    const reported = await this.UserModel.findOne({
                        where: { phone_num: report.phone_num },
                    });

                    let type = null;
                    if (user?.user_role === 2) {
                        type = 'Provider';
                    } else {
                        type = 'Customer';
                    }

                    return {
                        ...report,
                        user_name: user?.name,
                        user_phone: user?.phone_num,
                        user_profile: user?.image_url,
                        reported_id: reported?.id,
                        reported_user_name: reported?.name,
                        reported_user_phone: reported?.phone_num,
                        reported_user_profile: reported?.image_url,
                        type,
                    };
                })
            );

            const filteredReports = reportsWithUserData.filter((report) => {
                const searchLower = search.toLowerCase();
                return (
                    (report.user_name && report.user_name.toLowerCase().includes(searchLower)) ||
                    (report.user_phone && report.user_phone.toString().includes(searchLower)) ||
                    (report.reported_user_name && report.reported_user_name.toLowerCase().includes(searchLower)) ||
                    (report.reported_user_phone && report.reported_user_phone.toString().includes(searchLower))
                );
            });

            const paginatedData = CommonService.getPagingData(
                { count: filteredReports.length, rows: filteredReports },
                page,
                limit
            );

            return paginatedData;
        } catch (error) {
            throw new Error(error.message);
        }
    }





    async updateData(id: number, block_day: number ,is_pr_block:boolean) {
        try {
            const currentDate = new Date();
            const blockDate = new Date(currentDate);
            blockDate.setDate(currentDate.getDate() + block_day);

            const updateData = {
                is_block: true,
                block_day,
                is_pr_block,
                block_date: blockDate || null,
            };
            let response = await this.UserModel.update(id, updateData);

            if (response[0] === 0) {
                throw new Error('User not found or update failed');
            }

            return { message: 'User updated successfully', response };
        } catch (error) {
            throw new Error(`Failed to update user: ${error.message}`);
        }
    }



}