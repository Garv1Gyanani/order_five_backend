// src/template/template.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import CommonService from 'src/common/common.util';
import { OptionsMessage } from 'src/common/options';
import { CommonMessages } from 'src/common/common-messages';
import { Subscription } from 'src/schema/subscription.schema';
import { SubscriptionOrder } from 'src/schema/subscription.orders.schema';

@Injectable()
export class SubscriptionService {
    constructor(
        @InjectRepository(Subscription)
        private readonly SubscriptionModel: Repository<Subscription>,
        @InjectRepository(SubscriptionOrder)
        private readonly SubscriptionOrder: Repository<SubscriptionOrder>,
    ) { }

    // Get all Subscriptions with pagination and search
    async getAllPages(page: number = 1, pageSize: number = 10, search: string = '') {
        try {
            const { limit, offset } = CommonService.getPagination(page, pageSize);

            const [pages, count] = await this.SubscriptionModel.findAndCount({
                // where: { ...(search && { name: Like(`%${search}%`) }) },
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

}
