// src/template/template.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import CommonService from 'src/common/common.util';
import { OptionsMessage } from 'src/common/options';
import { CommonMessages } from 'src/common/common-messages';
import { Subscription } from 'src/schema/subscription.schema';
import { SubscriptionOrder } from 'src/schema/subscription.orders.schema';
import { User } from 'src/schema/user.schema';
import { Rating } from 'src/schema/rating.schema';
import { Order } from 'src/schema/order.schema';
import * as moment from 'moment-timezone';

@Injectable()
export class SubscriptionService {
    constructor(
        @InjectRepository(Subscription)
        private readonly SubscriptionModel: Repository<Subscription>,
        @InjectRepository(SubscriptionOrder)
        private readonly SubscriptionOrder: Repository<SubscriptionOrder>,
        @InjectRepository(Rating)
        private readonly RatingModel: Repository<Rating>,
        @InjectRepository(Order)
        private readonly Orders: Repository<Order>,
        @InjectRepository(User)
        private readonly UserModel: Repository<User>,
    ) { }

    // Get Subscription data
    async getData(id: number) {
        try {
            const Subscription = await this.SubscriptionModel.findOne({ where: { id: id } });

            if (!Subscription) {
                throw new Error(CommonMessages.notFound('Subscription'));
            }
            return Subscription;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async getDataByUserId(id: number) {
        try {
            const userSubscriptions = await this.UserModel.findOne({
                where: { id: id },
                select: [
                    'id',
                    'name',
                    'email',
                    'dialing_code',
                    'image_url',
                    'address_one',
                    'address_two',
                    'phone_num',
                    'createdAt',
                    'subscription_id',
                    'expiry_date',
                ],
            });

            if (!userSubscriptions) {
                throw new Error(CommonMessages.notFound('User subscription'));
            }


            const subscriptionData = userSubscriptions.subscription_id
                ? await this.SubscriptionModel.findOne({
                    where: { id: userSubscriptions.subscription_id },
                })
                : null;

            const ratings = await this.RatingModel.find({
                where: { provider_id: id },
            });

            const totalRatings = ratings.reduce((sum, rating) => {
                const ratingValue = Number(rating.rating);
                if (isNaN(ratingValue)) {
                    console.warn(`Invalid rating value: ${rating.rating}`);
                    return sum;
                }
                return sum + ratingValue;
            }, 0);

            const averageRating = ratings.length > 0 ? totalRatings / ratings.length : 0;
            const roundedAverageRating = Math.round(averageRating * 2) / 2;

            const orders = await this.Orders.find({
                where: { user_id: id, status: 'DELIVERED' },
            });

            const subscriptionOrder = await this.SubscriptionOrder.find({
                where: { user_id: id },
            });

            // Fetch names for users in subscriptionOrder
            const userIds = subscriptionOrder.map(order => order.user_id);
            const users = await this.UserModel.find({
                where: { id: In(userIds) }, // In is from TypeORM for matching multiple IDs
                select: ['id', 'name'],
            });

            const userMap = users.reduce((acc, user) => {
                acc[user.id] = user.name;
                return acc;
            }, {});

            // Add subscription status and user name
            const currentDate = new Date();
            const subscriptionOrderWithDetails = subscriptionOrder.map(order => {
                let sub_status = 'Expired'; // Default status
                if (userSubscriptions.expiry_date) {
                    const expiryDate = new Date(userSubscriptions.expiry_date);
                    if (expiryDate > currentDate) {
                        sub_status = 'Active';
                    }
                }
                return {
                    ...order,
                    sub_status,
                    user_name: userMap[order.user_id] || null, // Add user name if available
                };
            });

            const ordersCount = orders.length;
            const ratingCount = ratings.length;

            const response = {
                ...userSubscriptions,

                subscriptionDetails: subscriptionData || null,
                ratingCount: ratingCount,
                ordersCount: ordersCount,
                averageRating: roundedAverageRating,
                subscriptionOrder: subscriptionOrderWithDetails,
                amount: subscriptionData.amount

            };

            return response;
        } catch (error) {
            throw new Error(error.message);
        }
    }







    // Get all Subscriptions with pagination and search
    async getAllPages(page: number = 1, pageSize: number = 10, search: string = '') {
        try {
            const { limit, offset } = CommonService.getPagination(page, pageSize);

            const [pages, count] = await this.SubscriptionModel.findAndCount({
                where: search
                    ? [
                        { name: Like(`%${search}%`) },
                        { ar_name: Like(`%${search}%`) },
                    ]
                    : {},
                skip: offset,
                take: limit,
                order: { createdAt: 'DESC' },
            });

            const paginatedData = CommonService.getPagingData({ count, rows: pages }, page, limit);
            return paginatedData;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Get Subscription data by ID
    async getDatabyid(id: number) {
        try {
            const Subscription = await this.SubscriptionModel.findOne({ where: { id: id } });

            if (!Subscription) {
                throw new Error(CommonMessages.notFound('Subscription'));
            }

            return Subscription;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Create Subscription data
    async createData(data: any) {
        try {

            data.createdAt = moment.tz('Asia/Riyadh').format('YYYY-MM-DD HH:mm:ss');

            let newSubscription: any = await this.SubscriptionModel.create(data);
            newSubscription = await this.SubscriptionModel.save(newSubscription)
            return newSubscription;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Update Subscription data
    async updateData(id: number, updateData: Partial<Subscription>) {
        try {
            let response = await this.SubscriptionModel.update(id, updateData);
            if (response[0] === 0) {
                throw new Error("No Subscription data was updated.");
            }
            return response
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Delete Subscription data
    async deleteData(id: number) {
        try {
            const Subscription = await this.SubscriptionModel.findOne({ where: { id: id } });

            if (!Subscription) {
                throw new Error(CommonMessages.notFound('Subscription'));
            }

            await this.SubscriptionModel.softDelete(id);
            return Subscription;
        } catch (error) {
            throw new Error(error.message);
        }
    }




    async bulkDeletedata(ids: number[]): Promise<number> {
        try {
            const SubscriptionModel = await this.SubscriptionModel.find({ where: { id: In(ids) } });

            if (SubscriptionModel.length === 0) {
                throw new Error(CommonMessages.notFound('subscription'));
            }

            const result = await this.SubscriptionModel.softDelete(ids);

            return result.affected || 0;
        } catch (error) {
            throw new Error(error.message);
        }
    }


    async getsubscriberList(
        page: number = 1,
        pageSize: number = 10,
        s: string = '', // Search parameter
        status: string = '' // New parameter for filtering
    ) {
        try {
            const { limit, offset } = CommonService.getPagination(page, pageSize);
    
            const [pages, count] = await this.SubscriptionOrder.findAndCount({
                skip: offset,
                take: limit,
                order: { createdAt: 'DESC' },
            });
    
            const enrichedData = await Promise.all(
                pages.map(async (order) => {
                    const subscription = await this.SubscriptionModel.findOne({
                        where: { id: order.subscription_id },
                    });
    
                    const user = await this.UserModel.findOne({
                        where: { id: order.user_id },
                    });
    
                    const expiry_date = user ? user.expiry_date : null;
                    const now = new Date();
                    const sub_status = expiry_date && new Date(expiry_date) > now ? 'active' : 'expired';
    
                    return {
                        ...order,
                        plan_type: subscription ? subscription.name : 'N/A',
                        user_name: user ? user.name : 'N/A',
                        image: user ? user.image_url : 'N/A',
                        expiry_date: expiry_date,
                        sub_status: sub_status, // Added sub_status field
                    };
                })
            );
    
            const now = new Date();
            const filteredData = enrichedData.filter((item) => {
                // Filter by status (active or expired)
                if (status === 'active') {
                    return item.sub_status === 'active';
                } else if (status === 'expired') {
                    return item.sub_status === 'expired';
                }
                return true;
            }).filter((item) => {
                // Filter by search term in plan_type or user_name
                if (s) {
                    const searchTerm = s.toLowerCase();
                    const planType = item.plan_type ? item.plan_type.toLowerCase() : '';
                    const userName = item.user_name ? item.user_name.toLowerCase() : '';
                    return (
                        planType.includes(searchTerm) || userName.includes(searchTerm)
                    );
                }
                return true;
            });
    
            const paginatedData = CommonService.getPagingData(
                { count: filteredData.length, rows: filteredData },
                page,
                limit
            );
    
            return {
                status: true,
                message: 'Subscriber list has been retrieved successfully!',
                data: paginatedData,
            };
        } catch (error) {
            throw new Error(error.message);
        }
    }
    



}
