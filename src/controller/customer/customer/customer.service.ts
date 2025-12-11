// src/template/template.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { User } from 'src/schema/user.schema';
import * as bcrypt from 'bcryptjs';
import CommonService from 'src/common/common.util';
import { OptionsMessage } from 'src/common/options';
import { CommonMessages } from 'src/common/common-messages';
import { User_document } from 'src/schema/user_document.schema';
import { Rating } from 'src/schema/rating.schema';
import { Notification } from 'src/schema/notification.schema';

@Injectable()
export class CustomerService {
    constructor(
        @InjectRepository(User)
        private readonly UserModel: Repository<User>,
        @InjectRepository(User_document)
        private readonly CustomerDocumentModel: Repository<User_document>,
        @InjectRepository(Notification)
        private readonly NotificationService: Repository<Notification>,
        @InjectRepository(Rating)
        private readonly RatingModel: Repository<Rating>,
    ) { }

    async getCustomerData(id: number) {
        try {
            const customer = await this.UserModel.findOne({ where: { user_role: OptionsMessage.USER_ROLE.CUSTOMER, id: id } });

            if (!customer) {
                throw new Error(CommonMessages.notFound('Customer'));
            }

            const { password, ...customerData } = customer;

            const customerRatings = await this.RatingModel.find({
                where: { customer_id: id },
            });

            const totalRatings = customerRatings.length;

            // Calculate the average rating and round to the nearest 0.5
            const averageRating = totalRatings > 0
                ? Math.round(
                    (customerRatings.reduce((sum, rating) => sum + parseFloat(rating.rating as unknown as string || "0"), 0) / totalRatings) * 2
                ) / 2
                : 0;

            return {
                ...customerData,
                totalRatings,
                averageRating: averageRating.toFixed(1), // Ensure one decimal place
            };
        } catch (error) {
            throw new Error(error.message);
        }
    }


    // async getCustomerData(id: number) {
    //     try {
    //         const customer = await this.UserModel.findOne({ where: { user_role: OptionsMessage.USER_ROLE.CUSTOMER, id: id } });

    //         if (!customer) {
    //             throw new Error(CommonMessages.notFound('Customer'));
    //         }

    //         const { password, ...customerData } = customer;
    //         return customerData;
    //     } catch (error) {
    //         throw new Error(error.message);
    //     }
    // }

    // Get a list of customers
    async getCustomerList() {
        try {
            const customers = await this.UserModel.find({ where: { user_role: OptionsMessage.USER_ROLE.CUSTOMER } });

            if (!customers || customers.length === 0) {
                throw new Error(CommonMessages.notFound('Customer'));
            }

            return customers;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Get all customers with pagination and search
    async getAllPages(page: number = 1, pageSize: number = 10, search: string = '') {
        try {
            const { limit, offset } = CommonService.getPagination(page, pageSize);

            const [pages, count] = await this.UserModel.findAndCount({
                where: { user_role: OptionsMessage.USER_ROLE.CUSTOMER, ...(search && { name: Like(`%${search}%`) }), },
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

    // Get customer data by ID
    async getCustomerDatabyid(id: number) {
        try {
            const customer = await this.UserModel.findOne({ where: { id: id } });

            if (!customer) {
                throw new Error(CommonMessages.notFound('Customer'));
            }

            return customer;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Create customer data
    async createCustomerData(data: any) {
        try {
            data.user_role = OptionsMessage.USER_ROLE.CUSTOMER
            const customer = await this.UserModel.findOne({ where: { phone_num: data.phone_num } });

            if (customer) {
                throw new Error(CommonMessages.alreadyFound('Customer'));
            }

            let newCustomer: any = await this.UserModel.create(data);
            newCustomer = await this.UserModel.save(newCustomer)
            return newCustomer;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Update customer data
    async updateCustomerData(id: number, updateData: any) {
        try {
            const customer = await this.UserModel.findOne({ where: { id: id } });

            if (!customer) {
                throw new Error(CommonMessages.notFound('Customer'));
            }

            let response = await this.UserModel.update(id, updateData);

            if (response[0] === 0) {
                throw new Error("No customer data was updated.");
            }

            return response
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Delete customer data
    async deleteCustomerData(id: number) {
        try {
            const customer = await this.UserModel.findOne({ where: { id: id } });

            if (!customer) {
                throw new Error(CommonMessages.notFound('Customer'));
            }

            await this.UserModel.softDelete(id);
            return customer;
        } catch (error) {
            throw new Error(error.message);
        }
    }


    // Create customer document
    async createCustomerDocument(data: any) {
        try {
            let response: any = await this.CustomerDocumentModel.create(data);
            response = await this.CustomerDocumentModel.save(response)
            return response;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Get customer document
    async GetCustomerDocument(customer_id: any) {
        try {
            let response: any = await this.CustomerDocumentModel.find({ where: { user_id: customer_id } });
            response = await this.CustomerDocumentModel.save(response)
            return response;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Update customer document
    async UpdateCustomerDocument(id: any, data: any) {
        try {
            let response: any = await this.CustomerDocumentModel.update(id, data);
            response = await this.CustomerDocumentModel.save(response)
            return response;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Change customer password
    async changePassword(id: number, currentPassword: string, newPassword: string, confirmPassword: string) {
        try {
            if (newPassword !== confirmPassword) {
                throw new Error(CommonMessages.PWD_NOT_MATCH);
            }

            const customer = await this.UserModel.findOne({ where: { id: id } });

            if (!customer) {
                throw new Error(CommonMessages.notFound('Customer'));
            }

            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, customer.password);
            if (!isCurrentPasswordValid) {
                throw new Error('Current password is incorrect');
            }

            const salt = await bcrypt.genSalt();
            const hashedNewPassword = await bcrypt.hash(newPassword, salt);

            customer.password = hashedNewPassword;

            await this.UserModel.save(customer);
            return customer;
        } catch (error) {
            throw new Error(error.message);
        }
    }


    async getAllNotificationPages(customer_id: number, page: number = 1, pageSize: number = 10, search: string = '') {
        try {
            const { limit, offset } = CommonService.getPagination(page, pageSize);


            const [pages, count] = await this.NotificationService.findAndCount({
                where: [
                    { user_id: customer_id },
                    { user_id: null, user_type: 'customer' },
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
