// src/template/template.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { User } from 'src/schema/user.schema';
import * as bcrypt from 'bcryptjs';
import CommonService from 'src/common/common.util';
import { OptionsMessage } from 'src/common/options';
import { CommonMessages } from 'src/common/common-messages';
import { User_document } from 'src/schema/user_document.schema';
import { Report } from 'src/schema/report.schema';
import { Rating } from 'src/schema/rating.schema';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { Notification } from 'src/schema/notification.schema';
import { Subscription } from 'src/schema/subscription.schema';
import { ProductRequest } from 'src/schema/product_request.schema';
import { Product } from 'src/schema/product.schema';
import { Wallet_req } from 'src/schema/wallet_req.schema';
dotenv.config();
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CREDENTIALS || '{}')),
    });
}
@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly UserModel: Repository<User>,
        @InjectRepository(User_document)
        private readonly UserDocumentModel: Repository<User_document>,
        @InjectRepository(Report)
        private readonly Report: Repository<Report>,
        @InjectRepository(Rating)
        private readonly Rating: Repository<Rating>,
        @InjectRepository(Notification)
        private readonly NotificationModel: Repository<Notification>,
        @InjectRepository(Subscription)
        private readonly Subscription: Repository<Subscription>,
        @InjectRepository(ProductRequest)
        private readonly ProductReq: Repository<ProductRequest>,
        @InjectRepository(Product)
        private readonly product: Repository<Product>,
        @InjectRepository(Wallet_req)
        private readonly wallet_req: Repository<Wallet_req>,
    ) { }

    // Get user data
    // async getUserData(id: number) {
    //     try {
    //         const user = await this.UserModel.findOne({ where: { user_role: OptionsMessage.USER_ROLE.PROVIDER, id: id } });

    //         if (!user) {
    //             throw new Error(CommonMessages.notFound('Provider'));
    //         }

    //         const { password, subscription_id, expiry_date , ...userData } = user;

    //         const customerRatings = await this.Rating.find({
    //             where: { provider_id: id },
    //         });

    //         const totalRatings = customerRatings.length;
    //         const averageRating = totalRatings > 0
    //             ? customerRatings.reduce((sum, rating) => sum + parseFloat(rating.rating as unknown as string || "0"), 0) / totalRatings
    //             : 0;
    //         return {
    //             ...userData,
    //             totalRatings,
    //             averageRating: averageRating.toFixed(2),

    //         }
    //     } catch (error) {
    //         throw new Error(error.message);
    //     }
    // }

    async getUserData(id: number) {
        try {
            const user = await this.UserModel.findOne({
                where: { user_role: OptionsMessage.USER_ROLE.PROVIDER, id: id }
            });

            console.log(user);

            if (!user) {
                throw new Error(CommonMessages.notFound('Provider'));
            }

            const { password, subscription_id, ...userData } = user;

            let response: any = {
                ...userData,
                is_plan: true, // Static value
                is_expired: false, // Static value
                subscription: { // Static subscription data
                    id: 0,
                    name: "Premium Plan",
                    ar_name: "Premium Plan",
                    duration: "Yearly Plan",
                    duration_day: "365",
                    amount: 500,
                    features: "",
                    status: true,
                    createdAt: "2025-12-08T14:01:04.265Z",
                    updatedAt: "2025-12-08T14:01:04.265Z",
                },
            };

            if (subscription_id) {
                const subscription = await this.Subscription.findOne({ where: { id: subscription_id } });
                const txn_id = await this.wallet_req.findOne({
                    where: { user_id: id, order_type: "Subscription" },
                    order: { id: 'DESC' }
                });

                if (subscription) {
                    response.subscription = subscription;
                    response.txn_id = txn_id?.transaction_id || null;
                }
            }

            const customerRatings = await this.Rating.find({ where: { provider_id: id } });
            const totalRatings = customerRatings.length;

            // Calculate the average rating and round to the nearest 0.5
            const averageRating = totalRatings > 0
                ? Math.round(
                    (customerRatings.reduce((sum, rating) => sum + parseFloat(rating.rating as unknown as string || "0"), 0) / totalRatings) * 2
                ) / 2
                : 0;

            response.totalRatings = totalRatings;
            response.averageRating = averageRating.toFixed(2);

            const approvedRequests = await this.ProductReq.find({
                where: { user_id: id, deletedAt: null },
            });

            const productIds = approvedRequests.map(req => req.product_id);

            const validProductsCount = await this.product.count({
                where: {
                    id: In(productIds),
                    deletedAt: null
                }
            });

            response.product_count = validProductsCount;

            return response;
        } catch (error) {
            throw new Error(error.message);
        }
    }


    // async getUserData(id: number) {
    //     try {
    //         const user = await this.UserModel.findOne({
    //             where: { user_role: OptionsMessage.USER_ROLE.PROVIDER, id: id }
    //         });

    //         console.log(user);

    //         if (!user) {
    //             throw new Error(CommonMessages.notFound('Provider'));
    //         }

    //         const { password, subscription_id, ...userData } = user;

    //         let response: any = {
    //             ...userData,
    //             is_plan: !!subscription_id,
    //         };

    //         if (subscription_id) {
    //             const subscription = await this.Subscription.findOne({ where: { id: subscription_id } });
    //             const txn_id = await this.wallet_req.findOne({
    //                 where: { user_id: id, order_type: "Subscription" }, order: { id: 'DESC' }
    //             })

    //             if (subscription) {
    //                 response.subscription = subscription;
    //                 response.txn_id = txn_id.transaction_id || null
    //             }
    //         }

    //         const currentDate = new Date();
    //         response.is_expired = userData.expiry_date ? new Date(userData.expiry_date) < currentDate : true;

    //         const customerRatings = await this.Rating.find({ where: { provider_id: id } });
    //         const totalRatings = customerRatings.length;

    //         // Calculate the average rating and round to the nearest 0.5
    //         const averageRating = totalRatings > 0
    //             ? Math.round(
    //                 (customerRatings.reduce((sum, rating) => sum + parseFloat(rating.rating as unknown as string || "0"), 0) / totalRatings) * 2
    //               ) / 2
    //             : 0;

    //         response.totalRatings = totalRatings;
    //         response.averageRating = averageRating.toFixed(2);

    //         const approvedRequests = await this.ProductReq.find({
    //             where: { user_id: id, deletedAt: null },
    //         });

    //         const productIds = approvedRequests.map(req => req.product_id);

    //         const validProductsCount = await this.product.count({
    //             where: {
    //                 id: In(productIds),
    //                 deletedAt: null
    //             }
    //         });

    //         response.product_count = validProductsCount;

    //         return response;
    //     } catch (error) {
    //         throw new Error(error.message);
    //     }
    // }




    // Get a list of users
    async getUserList() {
        try {
            const users = await this.UserModel.find({ where: { user_role: OptionsMessage.USER_ROLE.PROVIDER } });

            if (!users || users.length === 0) {
                throw new Error(CommonMessages.notFound('Provider'));
            }

            return users;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Get all users with pagination and search
    async getAllPages(page: number = 1, pageSize: number = 10, search: string = '') {
        try {
            const { limit, offset } = CommonService.getPagination(page, pageSize);

            const [pages, count] = await this.UserModel.findAndCount({
                where: { user_role: OptionsMessage.USER_ROLE.PROVIDER, ...(search && { name: Like(`%${search}%`) }), },
                skip: offset,
                take: limit,
                order: { createdAt: 'DESC' }
            });

            const paginatedData = CommonService.getPagingData({ count, rows: pages }, page, limit);
            return paginatedData;
        } catch (error) {
            throw new Error(error.message);
        }
    }


    // Create user data
    async createUserData(data: any) {
        try {
            data.user_role = OptionsMessage.USER_ROLE.PROVIDER
            const user = await this.UserModel.findOne({ where: { phone_num: data.phone_num } });

            if (user) {
                throw new Error(CommonMessages.alreadyFound('Provider'));
            }

            let newUser: any = await this.UserModel.create(data);
            newUser = await this.UserModel.save(newUser)
            return newUser;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Update user data
    async updateUserData(id: number, updateData: Partial<User>) {
        try {
            const user = await this.UserModel.findOne({ where: { id: id } });

            if (!user) {
                throw new Error(CommonMessages.notFound('Provider'));
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

    async updateUserDataStatus(user_id: number, updateData: Partial<User>) {
        try {
            const user = await this.UserModel.findOne({ where: { id: user_id } });

            if (!user) {
                throw new Error(CommonMessages.notFound('Provider'));
            }

            let response = await this.UserModel.update(user_id, updateData);

            if (response[0] === 0) {
                throw new Error("No user data was updated.");
            }

            return response
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Delete user data
    async deleteUserData(id: number) {
        try {
            const user = await this.UserModel.findOne({ where: { id: id } });

            if (!user) {
                throw new Error(CommonMessages.notFound('Provider'));
            }

            await this.UserModel.softDelete(id);
            return user;
        } catch (error) {
            throw new Error(error.message);
        }
    }


    // Create user document (bulk insert)
    async createMultiUserDocument(documents: any[], is_resubmit: any, user_id: any) {
        try {
            const processedDocuments = [];

            if (is_resubmit) {
                for (const document of documents) {
                    const existingDocument = await this.UserDocumentModel.findOne({ where: { user_id: document.user_id, required_doc_id: document.required_doc_id, }, });
                    if (existingDocument) {
                        existingDocument.document = document.document;
                        existingDocument.status = OptionsMessage.USER_DOCUMENT.Requested;
                        const updatedDocument = await this.UserDocumentModel.save(existingDocument);
                        processedDocuments.push(updatedDocument);
                    } else {
                        const newDocument = await this.UserDocumentModel.save(document);
                        processedDocuments.push(newDocument);
                    }
                }
                let response: any = await this.UserModel.update(user_id, { status: OptionsMessage.PROVIDER_STATUS.Pending });
                await this.UserModel.save(response)
            } else {
                const newDocuments = await this.UserDocumentModel.save(documents);
                processedDocuments.push(...newDocuments);
            }

            return processedDocuments;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Create user document
    async createUserDocument(data: any) {
        try {
            let response: any = await this.UserDocumentModel.create(data);
            response = await this.UserDocumentModel.save(response)
            return response;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Get user document
    async GetUserDocument(user_id: any) {
        try {
            let response: any = await this.UserDocumentModel.find({ where: { user_id: user_id } });
            response = await this.UserDocumentModel.save(response)
            return response;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Update user document
    async UpdateUserDocument(id: any, data: any) {
        try {
            let response: any = await this.UserDocumentModel.update(id, data);
            response = await this.UserDocumentModel.save(response)
            return response;
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
                throw new Error(CommonMessages.notFound('Provider'));
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


    async reportCustomer(data: any) {
        try {
            const user = await this.UserModel.findOne({ where: { dialing_code: data.dial_code, phone_num: data.phone_num } })
            if (!user) {
                return {
                    status: false,
                    message: 'invalid customer!!',
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



    async reviewCustomer(data: any) {
        try {
            const existingReview = await this.Rating.findOne({
                where: {
                    customer_id: data?.customer_id,
                    order_id: data.order_id,
                },
            });
            console.log(existingReview, "existingReview")
            console.log(data)
            const realUser = await this.UserModel.findOne({ where: { id: existingReview?.customer_id } })

            const notificationTitle = "Customer Rating";
            const notificationDescription = `A provider has given a review. Please check the details`;

            const dataPayload = await this.NotificationModel.save({
                title: notificationTitle,
                description: notificationDescription,
                user_id: realUser.id,
                click_event: 'rating',
                createdAt: new Date(),
            });

            const deviceToken = realUser?.device_token;
            if (deviceToken) {
                const notificationPayload = {
                    notification: {
                        title: notificationTitle,
                        body: notificationDescription,
                    },
                    data: {
                        title: dataPayload.title,
                        description: dataPayload.description,
                        user_id: dataPayload.user_id.toString(), // Convert to string
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

            }

            if (existingReview) {
                console.log('hyyyyyyyyyyyyyyy')

                await this.Rating.update(existingReview.id, {
                    rating: data.rating,
                    review: data.review,
                });
                return { message: 'Review updated successfully', updated: true };
            } else {
                console.log('hyyyyyyyyyyyyyyy')
                const newEntry = this.Rating.create(data);
                await this.Rating.save(newEntry);
                return { message: 'Review created successfully', created: true };
            }

        } catch (error) {
            throw new Error(error.message);
        }

    }


    async getAllNotificationPages(provider: number, page: number = 1, pageSize: number = 10, search: string = '') {
        try {
            const { limit, offset } = CommonService.getPagination(page, pageSize);


            const [pages, count] = await this.NotificationModel.findAndCount({
                where: [
                    { user_id: provider },
                    { user_id: null, user_type: 'provider' },
                ],
                skip: offset,
                take: limit,
                order: { createdAt: 'DESC' }

            });

            const paginatedData = CommonService.getPagingData({ count, rows: pages }, page, limit);
            return paginatedData;
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
