// src/template/template.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Not, Repository } from 'typeorm';
import { User } from 'src/schema/user.schema';
import * as bcrypt from 'bcrypt';
import CommonService from 'src/common/common.util';
import { OptionsMessage } from 'src/common/options';
import { CommonMessages } from 'src/common/common-messages';
import { Op } from 'sequelize';
import * as moment from 'moment-timezone';
import { Rating } from 'src/schema/rating.schema';
import { Order } from 'src/schema/order.schema';
import { Wallet_req } from 'src/schema/wallet_req.schema';

@Injectable()
export class CustomerService {
    constructor(
        @InjectRepository(User)
        private readonly UserModel: Repository<User>,

        @InjectRepository(Rating)
        private readonly RatingModel: Repository<Rating>,
        @InjectRepository(Order)
        private readonly Order: Repository<Order>,
        @InjectRepository(Wallet_req)
        private readonly wallet_req: Repository<Wallet_req>,
    ) { }

    // Get user data
    async getData(id: number) {
        try {
            const user = await this.UserModel.findOne({
                where: {
                    user_role: OptionsMessage.USER_ROLE.CUSTOMER,
                    id: id
                }
            });

            if (!user) {
                throw new Error(CommonMessages.notFound('Customer'));
            }

            const orderCount = await this.Order.count({
                where: {
                    user_id: id,
                    status: Not(In(['CANCELBYCUSTOMER', 'CANCELBYPROVIDER', 'CANCELBYADMIN']))
                }
            });

            const ReviewRating = await this.RatingModel.count({
                where: {
                    customer_id: id,
                }
            });

            const ratings = await this.RatingModel.find({
                where: { customer_id: id },
                select: ['rating']
            });

            const totalRatings = ratings.length;
            const totalRatingSum = ratings.reduce((sum, item) => sum + Number(item.rating), 0);
            const averageRating = totalRatings > 0 ? totalRatingSum / totalRatings : 0;

            const roundedRating = Math.round(averageRating * 2) / 2;

            const walletRequests = await this.wallet_req.find({
                where: {
                    user_id: id,
                    amount_status: 'Debit',
                    status: 'Approved'
                },
                select: ['amount']
            });

            const walletAmount = walletRequests.reduce((sum, req) => sum + Number(req.amount), 0);

            const { password, ...userData } = user;
            return {
                ...userData, orderCount, walletAmount, ReviewRating, rating: roundedRating  
            };
        } catch (error) {
            throw new Error(error.message);
        }
    }


    // Get a list of users
    async getList() {
        try {
            const users = await this.UserModel.find({ where: { user_role: OptionsMessage.USER_ROLE.CUSTOMER } });

            if (!users || users.length === 0) {
                throw new Error(CommonMessages.notFound('Customer'));
            }

            return users;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Get all users with pagination and search
    // async getAllPages(page: number = 1, pageSize: number = 10, search: string = '', is_active: any) {
    //     try {
    //         const { limit, offset } = CommonService.getPagination(page, pageSize);

    //         // Construct dynamic where condition
    //         let whereConditions: any = { user_role: OptionsMessage.USER_ROLE.CUSTOMER };

    //         // Add search condition for multiple fields
    //         if (search) {
    //             whereConditions = [
    //                 { user_role: OptionsMessage.USER_ROLE.CUSTOMER, phone_num: Like(`%${search}% COLLATE utf8mb4_general_ci`) },
    //                 { user_role: OptionsMessage.USER_ROLE.CUSTOMER, email: Like(`%${search}% COLLATE utf8mb4_general_ci`) },
    //                 { user_role: OptionsMessage.USER_ROLE.CUSTOMER, name: Like(`%${search}% COLLATE utf8mb4_general_ci`) },
    //             ];
    //         }


    //         // Add is_active condition
    //         if (is_active !== undefined && is_active !== 'all' && is_active !== 'All') {
    //             whereConditions = whereConditions.map((condition: any) => ({
    //                 ...condition,
    //                 is_active: is_active === '1' ? true : is_active === '0' ? false : undefined,
    //             }));
    //         }

    //         // Query database with constructed whereConditions
    //         const [pages, count] = await this.UserModel.findAndCount({
    //             where: whereConditions,
    //             skip: offset,
    //             take: limit,
    //             order: { createdAt: 'DESC' },
    //         });

    //         // Prepare paginated response
    //         const paginatedData = CommonService.getPagingData({ count, rows: pages }, page, limit);
    //         return paginatedData;
    //     } catch (error) {
    //         throw new Error(error.message);
    //     }
    // }


    async getAllPages(page: number = 1, pageSize: number = 10, search: string = '', is_active: any) {
        try {
            const { limit, offset } = CommonService.getPagination(page, pageSize);

            // Construct base condition
            let whereConditions: any = [{ user_role: OptionsMessage.USER_ROLE.CUSTOMER }];

            // Add search condition for multiple fields
            if (search) {
                whereConditions = [
                    { user_role: OptionsMessage.USER_ROLE.CUSTOMER, phone_num: Like(`%${search}%`) },
                    { user_role: OptionsMessage.USER_ROLE.CUSTOMER, email: Like(`%${search}%`) },
                    { user_role: OptionsMessage.USER_ROLE.CUSTOMER, name: Like(`%${search}%`) },
                    { user_role: OptionsMessage.USER_ROLE.CUSTOMER, address_one: Like(`%${search}%`) },
                ];
            }
            // Add is_active condition
            if (is_active !== undefined && is_active !== 'all' && is_active !== 'All') {
                const activeStatus = is_active === '1' ? true : is_active === '0' ? false : undefined;
                if (Array.isArray(whereConditions)) {
                    whereConditions = whereConditions.map((condition: any) => ({
                        ...condition,
                        is_active: activeStatus,
                    }));
                } else {
                    whereConditions.is_active = activeStatus; // If it's a single object, add the `is_active` condition directly.
                }
            }
            // Query database with constructed whereConditions
            const [pages, count] = await this.UserModel.findAndCount({
                where: whereConditions,
                skip: offset,
                take: limit,
                order: { id: 'DESC' },


            });
            console.log(pages, "pages")

            const customerIds = pages.map((page) => page.id);

            let ratings = [];
            if (customerIds.length > 0) {
                ratings = await this.RatingModel.createQueryBuilder('ratings')
                    .select('ratings.customer_id', 'customerId')
                    .addSelect('AVG(ratings.rating)', 'averageRating')
                    .addSelect('COUNT(ratings.rating)', 'ratingCount')
                    .where('ratings.customer_id IN (:...customerIds)', { customerIds })
                    .groupBy('ratings.customer_id')
                    .getRawMany();
            }

            const roundToHalf = (value: number) => Math.round(value * 2) / 2;

            const ratingsMap = ratings.reduce((acc, rating) => {
                acc[rating.customerId] = {
                    averageRating: roundToHalf(parseFloat(rating.averageRating)),
                    ratingCount: parseInt(rating.ratingCount, 10),
                };
                return acc;
            }, {});

            const customersWithRatings = pages.map((customer) => ({
                ...customer,
                averageRating: ratingsMap[customer.id]?.averageRating || 0, // Default to 0 if no ratings
                ratingCount: ratingsMap[customer.id]?.ratingCount || 0,   // Default to 0 if no ratings
            }));
            const paginatedData = CommonService.getPagingData({ count, rows: customersWithRatings }, page, limit);
            return paginatedData;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // async getAllPages(page: number = 1, pageSize: number = 10, search: string = '', is_active: any) {
    //     try {
    //         const { limit, offset } = CommonService.getPagination(page, pageSize);

    //         // Construct base condition
    //         let whereConditions: any = [{ user_role: OptionsMessage.USER_ROLE.CUSTOMER }];

    //         // Add search condition for multiple fields
    //         if (search) {
    //             whereConditions = [
    //                 { user_role: OptionsMessage.USER_ROLE.CUSTOMER, phone_num: Like(`%${search}%`) },
    //                 { user_role: OptionsMessage.USER_ROLE.CUSTOMER, email: Like(`%${search}%`) },
    //                 { user_role: OptionsMessage.USER_ROLE.CUSTOMER, name: Like(`%${search}%`) },
    //                 { user_role: OptionsMessage.USER_ROLE.CUSTOMER, address_one: Like(`%${search}%`) },
    //             ];
    //         }

    //         // Add is_active condition
    //         if (is_active !== undefined && is_active !== 'all' && is_active !== 'All') {
    //             const activeStatus = is_active === '1' ? true : is_active === '0' ? false : undefined;
    //             if (Array.isArray(whereConditions)) {
    //                 whereConditions = whereConditions.map((condition: any) => ({
    //                     ...condition,
    //                     is_active: activeStatus,
    //                 }));
    //             } else {
    //                 whereConditions.is_active = activeStatus; // If it's a single object, add the `is_active` condition directly.
    //             }
    //         }

    //         // Query database with constructed whereConditions
    //         const [pages, count] = await this.UserModel.findAndCount({
    //             where: whereConditions,
    //             skip: offset,
    //             take: limit,
    //             order: { createdAt: 'DESC' },
    //         });

    //         // Prepare paginated response
    //         const paginatedData = CommonService.getPagingData({ count, rows: pages }, page, limit);
    //         return paginatedData;
    //     } catch (error) {
    //         throw new Error(error.message);
    //     }
    // }

    // Get user data by ID
    async getDatabyid(id: number) {
        try {
            const user = await this.UserModel.findOne({ where: { id: id } });

            if (!user) {
                throw new Error(CommonMessages.notFound('Customer'));
            }

            return user;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Create user data

    async createData(data: any) {
        try {
            // Set the user_role to "CUSTOMER"
            data.user_role = OptionsMessage.USER_ROLE.CUSTOMER;

            // Get the current time in Saudi Arabia (Riyadh) timezone (GMT+3)
            data.createdAt = moment.tz('Asia/Riyadh').format('YYYY-MM-DD HH:mm:ss');

            // Check if a user already exists with the provided phone number
            const user = await this.UserModel.findOne({ where: { phone_num: data.phone_num } });

            if (user) {
                throw new Error(CommonMessages.alreadyFound('Customer'));
            }

            // Create a new user with the adjusted time
            let newuser: any = await this.UserModel.create(data);
            newuser = await this.UserModel.save(newuser);

            return newuser;
        } catch (error) {
            throw new Error(error.message);
        }
    }


    // Update user data
    async updateData(id: number, updateData: Partial<User>) {
        try {
            const user = await this.UserModel.findOne({ where: { id: id } });

            if (!user) {
                throw new Error(CommonMessages.notFound('Customer'));
            }

            let response = await this.UserModel.update(id, updateData);

            if (response[0] === 0) {
                throw new Error("No user data was updated.");
            }

            return response
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Delete user data
    async deleteData(id: number) {
        try {
            const user = await this.UserModel.findOne({ where: { id: id } });

            if (!user) {
                throw new Error(CommonMessages.notFound('Customer'));
            }

            await this.UserModel.softDelete(id);
            return user;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async bulkDeletedata(ids: number[]): Promise<number> {
        try {
            const categories = await this.UserModel.find({ where: { id: In(ids) } });

            if (categories.length === 0) {
                throw new Error(CommonMessages.notFound('Categories'));
            }

            const result = await this.UserModel.softDelete(ids);

            return result.affected || 0;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Change user password
    async changePassword(id: number, currentPassword: string, newPassword: string, confirmPassword: string) {
        try {
            if (newPassword !== confirmPassword) {
                throw new Error(CommonMessages.PWD_NOT_MATCH);
            }

            const user = await this.UserModel.findOne({ where: { id: id } });

            if (!user) {
                throw new Error(CommonMessages.notFound('Customer'));
            }

            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                throw new Error('Current password is incorrect');
            }

            const salt = await bcrypt.genSalt();
            const hashedNewPassword = await bcrypt.hash(newPassword, salt);

            user.password = hashedNewPassword;

            await this.UserModel.save(user);
            return user;
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
