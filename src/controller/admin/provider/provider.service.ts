// src/template/template.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { User } from 'src/schema/user.schema';
import * as bcrypt from 'bcrypt';
import CommonService from 'src/common/common.util';
import { OptionsMessage } from 'src/common/options';
import { CommonMessages } from 'src/common/common-messages';
import { User_document } from 'src/schema/user_document.schema';
import * as moment from 'moment-timezone';
import { Rating } from 'src/schema/rating.schema';
import { Subscription } from 'src/schema/subscription.schema';

@Injectable()
export class ProviderService {
    constructor(
        @InjectRepository(User)
        private readonly UserModel: Repository<User>,
        @InjectRepository(User_document)
        private readonly UserDocumentModel: Repository<User_document>,
        
        @InjectRepository(Rating)
        private readonly RatingModel: Repository<Rating>,
        
        @InjectRepository(Subscription)
        private readonly SubscriptionModel: Repository<Subscription>,
    ) { }

    // Get user data
    async getUserData(id: number) {
        try {
            const user = await this.UserModel.findOne({ where: { id: id } });

            if (!user) {
                throw new Error(CommonMessages.notFound('Provider'));
            }

            const { password, ...userData } = user;
            return userData;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Get a list of users
    async getUserList() {
        try {
            const users = await this.UserModel.find({ where: { user_role: OptionsMessage.USER_ROLE.PROVIDER} });

            if (!users || users.length === 0) {
                throw new Error(CommonMessages.notFound('Provider'));
            }

            return users;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Get all users with pagination and search
    // async getAllPages(page: number = 1, pageSize: number = 10, search: string = '') {
    //     try {
    //         const { limit, offset } = CommonService.getPagination(page, pageSize);

    //         let whereConditions: any = { user_role: OptionsMessage.USER_ROLE.PROVIDER };
    //         if (search) {
    //             whereConditions = [
    //                 { user_role: OptionsMessage.USER_ROLE.PROVIDER, phone_num: Like(`%${search}%`) },
    //                 { user_role: OptionsMessage.USER_ROLE.PROVIDER, email: Like(`%${search}%`) },
    //                 { user_role: OptionsMessage.USER_ROLE.PROVIDER, name: Like(`%${search}%`) },
    //             ];
    //         }
            
    //         const [pages, count] = await this.UserModel.findAndCount({
    //             where: whereConditions,
    //             skip: offset,
    //             take: limit,
    //             order: { createdAt: 'DESC' }
    //         });

    //         const paginatedData = CommonService.getPagingData({ count, rows: pages }, page, limit);
    //         return paginatedData;
    //     } catch (error) {
    //         throw new Error(error.message);
    //     }
    // }

    async getAllPages(page: number = 1, pageSize: number = 10, search: string = '') {
        try {
            const { limit, offset } = CommonService.getPagination(page, pageSize);
    
            // Construct base condition
            let whereConditions: any = { user_role: OptionsMessage.USER_ROLE.PROVIDER };
            if (search) {
                whereConditions = [
                    { user_role: OptionsMessage.USER_ROLE.PROVIDER, phone_num: Like(`%${search}%`) },
                    { user_role: OptionsMessage.USER_ROLE.PROVIDER, email: Like(`%${search}%`) },
                    { user_role: OptionsMessage.USER_ROLE.PROVIDER, name: Like(`%${search}%`) },
                ];
            }
    
            // Fetch providers with pagination
            const [providers, count] = await this.UserModel.findAndCount({
                where: whereConditions,
                skip: offset,
                take: limit,
                order: { createdAt: 'DESC' },
            });
    
            const providerIds = providers.map((provider) => provider.id);
            const subscriptionIds = providers
                .map((provider) => provider.subscription_id)
                .filter((id) => id !== null); // Remove null values
    
            let ratings = [];
            if (providerIds.length > 0) {
                ratings = await this.RatingModel.createQueryBuilder('ratings')
                    .select('ratings.provider_id', 'providerId')
                    .addSelect('AVG(ratings.rating)', 'averageRating')
                    .addSelect('COUNT(ratings.rating)', 'ratingCount')
                    .where('ratings.provider_id IN (:...providerIds)', { providerIds })
                    .groupBy('ratings.provider_id')
                    .getRawMany();
            }
    
            let subscriptionsMap = {};
            if (subscriptionIds.length > 0) {
                const subscriptions = await this.SubscriptionModel.find({
                    where: { id: In(subscriptionIds) },
                    select: ['id', 'name'],
                });
    
                // Map subscription id to its name
                subscriptionsMap = subscriptions.reduce((acc, sub) => {
                    acc[sub.id] = sub.name;
                    return acc;
                }, {});
            }
    
                // Function to round to the nearest 0.5
                const roundToHalf = (value: number) => Math.round(value * 2) / 2;
    
            // Map ratings to providers and add subscription plan_type
            const ratingsMap = ratings.reduce((acc, rating) => {
                acc[rating.providerId] = {
                    averageRating: roundToHalf(parseFloat(rating.averageRating)),
                    ratingCount: parseInt(rating.ratingCount, 10),
                };
                return acc;
            }, {});
    
            const providersWithDetails = providers.map((provider) => ({
                ...provider,
                averageRating: ratingsMap[provider.id]?.averageRating || 0, // Default to 0 if no ratings
                ratingCount: ratingsMap[provider.id]?.ratingCount || 0,   // Default to 0 if no ratings
                plan_type: provider.subscription_id ? subscriptionsMap[provider.subscription_id] || null : null, // Get subscription name
            }));
    
            const paginatedData = CommonService.getPagingData({ count, rows: providersWithDetails }, page, limit);
            return paginatedData;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    
    
    // async getAllPages(page: number = 1, pageSize: number = 10, search: string = '') {
    //     try {
    //         const { limit, offset } = CommonService.getPagination(page, pageSize);
    
    //         let whereConditions: any = { user_role: OptionsMessage.USER_ROLE.PROVIDER };
    //         if (search) {
    //             whereConditions = [
    //                 { user_role: OptionsMessage.USER_ROLE.PROVIDER, phone_num: Like(`%${search}%`) },
    //                 { user_role: OptionsMessage.USER_ROLE.PROVIDER, email: Like(`%${search}%`) },
    //                 { user_role: OptionsMessage.USER_ROLE.PROVIDER, name: Like(`%${search}%`) },
    //             ];
    //         }
    
    //         // Fetch providers with pagination
    //         const [providers, count] = await this.UserModel.findAndCount({
    //             where: whereConditions,
    //             skip: offset,
    //             take: limit,
    //             order: { createdAt: 'DESC' }
    //         });
    
    //         // Fetch average ratings for each provider
    //         const providerIds = providers.map((provider) => provider.id);
    
    //         const ratings = await this.RatingModel.createQueryBuilder('ratings')
    //             .select('ratings.provider_id', 'providerId')
    //             .addSelect('AVG(ratings.rating)', 'averageRating')
    //             .where('ratings.provider_id IN (:...providerIds)', { providerIds })
    //             .groupBy('ratings.provider_id')
    //             .getRawMany();
    
    //         // Function to round to the nearest 0.5
    //         const roundToHalf = (value: number) => Math.round(value * 2) / 2;
    
    //         // Map ratings to their respective providers
    //         const ratingsMap = ratings.reduce((acc, rating) => {
    //             acc[rating.providerId] = roundToHalf(parseFloat(rating.averageRating));
    //             return acc;
    //         }, {});
    
    //         // Add ratings to provider data
    //         const providersWithRatings = providers.map((provider) => ({
    //             ...provider,
    //             averageRating: ratingsMap[provider.id] || 0, // Default to 0 if no ratings
    //         }));
    
    //         const paginatedData = CommonService.getPagingData({ count, rows: providersWithRatings }, page, limit);
    //         return paginatedData;
    //     } catch (error) {
    //         throw new Error(error.message);
    //     }
    // }
    
    
    

    // Create user data
 
    async createUserData(data: any) {
        try {
            // Set the createdAt field to the current time in Saudi Arabia (Riyadh) timezone (GMT+3)
            data.createdAt = moment.tz('Asia/Riyadh').format('YYYY-MM-DD HH:mm:ss');
    
            // Set the user role to PROVIDER
            data.user_role = OptionsMessage.USER_ROLE.PROVIDER;
    
            // Check if the user already exists
            const user = await this.UserModel.findOne({ where: { phone_num: data.phone_num } });
    
            if (user) {
                throw new Error(CommonMessages.alreadyFound('Provider'));
            }
    
            // Create a new user with the adjusted time
            let newUser: any = await this.UserModel.create(data);
            newUser = await this.UserModel.save(newUser);
    
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

    async bulkDeletedata(ids: number[]): Promise<number> {
        try {
            const categories = await this.UserModel.find({ where: { id: In(ids) } });

            if (categories.length === 0) {
                throw new Error(CommonMessages.notFound('Provider'));
            }

            const result = await this.UserModel.softDelete(ids);

            return result.affected || 0;
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
            let response: any = await this.UserDocumentModel.find(
                {
                    where: { user_id: user_id },
                    relations: ['required_doc'],
                    select: {
                        required_doc: { id: true, title: true, ar_title: true, type:true, is_required: true }
                    },
                }
            );
            response = await this.UserDocumentModel.save(response)
            let newresponse = []
            for (const element of response) {
                newresponse.push({
                    "id": element?.id,
                    "user_id": element?.user_id,
                    "required_doc_id": element?.required_doc_id,
                    "document": element?.document,
                    "preview": element?.document,
                    "status": element?.status,
                    "createdAt": element?.createdAt,
                    "updatedAt": element?.updatedAt,
                    "deletedAt": element?.deletedAt,
                    "title": element?.required_doc?.title,
                    "ar_title": element?.required_doc?.ar_title,
                    "is_required": element?.required_doc?.is_required,
                    "type": element?.required_doc?.type,

                })
            }
            return newresponse
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Update user document
    async UpdateUserDocument(id: any, data: any) {
        try {
            let response: any = await this.UserDocumentModel.update(id, data);
            // response = await this.UserDocumentModel.save(response)
            return response;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Change user password
    async changePassword(id: number, old_pass: string, new_pass: string, confirm_pass: string) {
        try {
            if (new_pass !== confirm_pass) {
                throw new Error(CommonMessages.PWD_NOT_MATCH);
            }

            const user = await this.UserModel.findOne({ where: { id: id } });

            if (!user) {
                throw new Error(CommonMessages.notFound('Provider'));
            }

            const isCurrentPasswordValid = await bcrypt.compare(old_pass, user.password);
            if (!isCurrentPasswordValid) {
                throw new Error('Current password is incorrect');
            }

            const salt = await bcrypt.genSalt();
            const hashedNewPassword = await bcrypt.hash(new_pass, salt);

            user.password = hashedNewPassword;

            await this.UserModel.save(user);
            return user;
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
