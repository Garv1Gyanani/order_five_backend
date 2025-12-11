import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Product } from 'src/schema/product.schema';
import * as bcrypt from 'bcrypt';
import CommonService from 'src/common/common.util';
import { OptionsMessage } from 'src/common/options';
import { CommonMessages } from 'src/common/common-messages';
import { ProductRequest } from 'src/schema/product_request.schema';
import { ProviderWishlist } from 'src/schema/wishlist.schema';
import { User } from 'src/schema/user.schema';
import { Rating } from 'src/schema/rating.schema';
import { Report } from 'src/schema/report.schema';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { Notification } from 'src/schema/notification.schema';
dotenv.config();
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CREDENTIALS || '{}')),
    });
}
@Injectable()
export class ProductWishListService {
    constructor(
        @InjectRepository(ProviderWishlist)
        private readonly ProviderWishlist: Repository<ProviderWishlist>,
        @InjectRepository(Report)
        private readonly Report: Repository<Report>,
        @InjectRepository(User)
        private readonly User: Repository<User>,
        @InjectRepository(Rating)
        private readonly Rating: Repository<Rating>,
        @InjectRepository(Notification)
        private readonly NotificationModel: Repository<Notification>,

    ) { }

    async createData(data: any) {
        try {
            const { user_id, provider_id } = data;

            const existingEntry = await this.ProviderWishlist.findOne({
                where: { user_id, provider_id },
            });

            if (existingEntry) {
                await this.ProviderWishlist.delete(existingEntry.id);
                return { message: 'Wishlist entry removed', action: 'removed' };
            } else {
                const newEntry = this.ProviderWishlist.create(data);
                await this.ProviderWishlist.save(newEntry);
                return { message: 'Wishlist entry added', action: 'added' };
            }
        }
        catch (error) {
            throw new Error(error.message);
        }

    }

    async getAllPages(page: number = 1, pageSize: number = 10, search: string = '', user_id: any) {
        try {
            const { limit, offset } = CommonService.getPagination(page, pageSize);

            const [pages, count] = await this.ProviderWishlist.findAndCount({
                where: { user_id },
                skip: offset,
                take: limit,
                order: { createdAt: 'DESC' },
            });

            const providerIds = pages.map((item) => item.provider_id);

            if (providerIds.length === 0) {
                return {
                    status: true,
                    message: 'Wishlist list has been got successfully!',
                    data: CommonService.getPagingData({ count: 0, rows: [] }, page, limit),
                };
            }

            let userDetailsQuery = this.User.createQueryBuilder('user')
                .where('user.id IN (:...providerIds)', { providerIds });

            if (search) {
                userDetailsQuery = userDetailsQuery.andWhere('user.name LIKE :search', {
                    search: `%${search}%`,
                });
            }

            const userDetails = await userDetailsQuery.getMany();

            const filteredProviderIds = userDetails.map((user) => user.id);
            const filteredPages = pages.filter((wishlistItem) =>
                filteredProviderIds.includes(wishlistItem.provider_id)
            );

            if (filteredProviderIds.length === 0) {
                return {
                    status: true,
                    message: 'Wishlist list has been got successfully!',
                    data: CommonService.getPagingData({ count: 0, rows: [] }, page, limit),
                };
            }

            const ratings = await this.Rating.createQueryBuilder('rating')
                .where('rating.provider_id IN (:...providerIds)', { providerIds: filteredProviderIds })
                .getMany();

            const wishlistWithUserDetails = filteredPages.map((wishlistItem) => {
                const userDetail = userDetails.find(
                    (user) => user.id === wishlistItem.provider_id
                );

                const providerRatings = ratings.filter(
                    (rating) => rating.provider_id === wishlistItem.provider_id
                );
                const totalCount = providerRatings.length.toString();
                const averageRating = totalCount !== "0"
                    ? (providerRatings.reduce((sum, r) => sum + r.rating, 0) / parseInt(totalCount)).toFixed(2)
                    : "0.00";

                return {
                    ...wishlistItem,
                    userDetail: userDetail || null,
                    totalRatingCount: totalCount,
                    averageRating,
                    isWish: true,
                };
            });


            const paginatedData = CommonService.getPagingData(
                { count: wishlistWithUserDetails.length, rows: wishlistWithUserDetails },
                page,
                limit
            );

            return {
                status: true,
                message: 'Wishlist list has been got successfully!',
                data: paginatedData,
            };
        } catch (error) {
            throw new Error(error.message);
        }
    }



    async reportProvider(data: any) {
        try {
            const user = await this.User.findOne({ where: { phone_num: data.phone_num, dialing_code: data.dial_code } })
            if (!user) {
                return {
                    status: false,
                    message: 'invalid provider!!',
                };
            }
            const newEntry = this.Report.create(data);
            await this.Report.save(newEntry);
            return {
                status: true,
                message: 'report added successful',
            };

        }
        catch (error) {
            throw new Error(error.message);
        }

    }

    async reviewProvider(data: any) {
        try {
            const existingReview = await this.Rating.findOne({
                where: {
                    provider_id: data.provider_id,
                    order_id: data.order_id,
                },
            });
            const realUser = await this.User.findOne({ where: { id: data.provider_id } })

            const notificationTitle = "Provider Rating";
            const notificationDescription = `A customer has given a review. Please check the details`;


          const dataPayload=  await this.NotificationModel.save({
                title: notificationTitle,
                description: notificationDescription,
                user_id: realUser.id,
                click_event: 'rating',
                createdAt: new Date(),
            });

            const deviceToken = realUser.device_token;
            if (deviceToken) {
                const notificationPayload = {
                    notification: {
                        title: notificationTitle,
                        body: notificationDescription,
                    },
                    data: {
                        title: dataPayload.title,
                        description: dataPayload.description,
                        user_id: dataPayload.user_id.toString(), 
                        click_event: dataPayload.click_event,
                        createdAt: dataPayload.createdAt.toISOString(),
                    },
                    token: deviceToken,
                };

                try {
                    const response = await admin.messaging().send(notificationPayload);
                    console.log(`Notification sent successfully: ${response}`);
                } catch (error) {
                    console.error('Error sending notification:', error.message || error);
                }
            } else {
                console.log('No device token found for the user.');
            }

            if (existingReview) {
                await this.Rating.update(existingReview.id, {
                    rating: data.rating,
                    review: data.review,
                });
                return { message: 'Review updated successfully', updated: true };
            } else {
                const newEntry = this.Rating.create(data);
                await this.Rating.save(newEntry);
                return { message: 'Review created successfully', created: true };
            }



        } catch (error) {
            throw new Error(error.message);
        }
    }


}
