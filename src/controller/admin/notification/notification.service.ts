// src/template/template.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Like, Repository } from 'typeorm';
import { Product } from 'src/schema/product.schema';
import * as bcrypt from 'bcryptjs';
import CommonService from 'src/common/common.util';
import { OptionsMessage } from 'src/common/options';
import { CommonMessages } from 'src/common/common-messages';
import { ProductRequest } from 'src/schema/product_request.schema';
import { User } from 'src/schema/user.schema';
import { User_location } from 'src/schema/user_location.schema';
import * as geolib from 'geolib';
import axios from 'axios';
import { Rating } from 'src/schema/rating.schema';
import { ProviderWishlist } from 'src/schema/wishlist.schema';
import { v4 as uuidv4 } from 'uuid';
import { Notification } from 'src/schema/notification.schema';
import { Wallet_req } from 'src/schema/wallet_req.schema';
import { Op, where } from 'sequelize';
import { Setting } from 'src/schema/setting.schema';
import * as dotenv from 'dotenv';
dotenv.config();
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CREDENTIALS || '{}')),
    });
}
@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Product)
        private readonly ProductModel: Repository<Product>,
        @InjectRepository(ProductRequest)
        private readonly ProductRequestModel: Repository<ProductRequest>,
        @InjectRepository(User)
        private readonly UserRequestModel: Repository<User>,
        @InjectRepository(User_location)
        private readonly UserLocationModel: Repository<User_location>,
        @InjectRepository(Rating)
        private readonly RatingModel: Repository<Rating>,
        @InjectRepository(ProviderWishlist)
        private readonly WishlistModel: Repository<ProviderWishlist>,
        @InjectRepository(Notification)
        private readonly NotificationModel: Repository<Notification>,
        @InjectRepository(Wallet_req)
        private readonly Wallet_req: Repository<Wallet_req>,
        @InjectRepository(Setting)
        private readonly Setting: Repository<Setting>,

    ) { }



    async sendPushNotification(
        payload: { title: string; description: string; image: string; user_type: string },
    ) {
        try {


            await this.NotificationModel.save({
                title: payload.title,
                description: payload.description,
                user_type: payload.user_type,
                image: payload.image,
                createdAt: new Date(),
            });

            let roleIds: number[] = [];

            if (payload.user_type === 'provider') {
                roleIds = [2];
            } else if (payload.user_type === 'customer') {
                roleIds = [3];
            } else if (payload.user_type === 'both') {
                roleIds = [2, 3];
            } else {
                console.error('Invalid user_type provided.');
                return;
            }

            const userTokens = await this.UserRequestModel.find({
                where: { user_role: In(roleIds) },
                select: ['id', 'device_token'],
            });

            const deviceTokens = userTokens.map((user) => user.device_token).filter((token) => !!token);
            console.log(deviceTokens)
            if (deviceTokens.length === 0) {
                console.log('No valid device tokens found.');
            } else {
                const chunkSize = 50;
                const chunks = [];
                for (let i = 0; i < deviceTokens.length; i += chunkSize) {
                    chunks.push(deviceTokens.slice(i, i + chunkSize));
                }

                let totalSuccess = 0;
                let totalFailure = 0;

                for (const chunk of chunks) {
                    const message = {
                        notification: {
                            title: payload.title,
                            body: payload.description,
                            image: payload.image,
                        },
                        tokens: chunk,
                    };

                    const response = await admin.messaging().sendEachForMulticast(message);

                    totalSuccess += response.successCount;
                    totalFailure += response.failureCount;

                    response.responses.forEach((res, index) => {
                        if (!res.success) {
                            console.error(
                                `Failed to send notification to token ${chunk[index]}:`,
                                res.error?.message || 'Unknown error'
                            );
                        }
                    });
                }

                console.log(
                    `Push Notification Results: ${totalSuccess} sent successfully, ${totalFailure} failed.`,
                );
            }



        } catch (error) {
            console.error('Error sending push notification:', error.message || error);
            throw new Error('Failed to send push notifications');
        }
    }





    async getAllPages(page: number = 1, pageSize: number = 10, search: string = '') {
        try {
            const { limit, offset } = CommonService.getPagination(page, pageSize);

            const whereCondition: any = {};
            if (search) {
                whereCondition.title = Like(`%${search}%`)
            }
            const [pages, count] = await this.NotificationModel.findAndCount({
                where: whereCondition,
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



}
