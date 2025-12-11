// src/template/template.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { ProductRequest } from 'src/schema/product_request.schema';
import CommonService from 'src/common/common.util';
import { CommonMessages } from 'src/common/common-messages';
import * as moment from 'moment-timezone';

@Injectable()
export class ProductRequestService {
    constructor(
        @InjectRepository(ProductRequest)
        private readonly ProductRequestModel: Repository<ProductRequest>,
    ) { }

    // Get ProductRequest data
    async getData(id: number) {
        try {
            const ProductRequest = await this.ProductRequestModel.findOne({ where: { id: id }, relations: ['user', 'product'], });

            if (!ProductRequest) {
                throw new Error(CommonMessages.notFound('ProductRequest'));
            }
            return ProductRequest;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Get all ProductRequests with pagination and search
    async getAllPages(
        page: number = 1,
        pageSize: number = 10,
        search: string = '',
        status: string,
        category_id: any
    ) {
        try {
            const { limit, offset } = CommonService.getPagination(page, pageSize);
    
            const queryBuilder = this.ProductRequestModel.createQueryBuilder('productRequest')
                .leftJoinAndSelect('productRequest.user', 'user')
                .leftJoinAndSelect('productRequest.product', 'product')
                .leftJoinAndSelect('product.category', 'category')
                .select([
                    'productRequest',
                    'user.name',
                    'user.address_one',
                    'user.address_two',
                    'product.provider_type',
                    'product.product_img',
                    'product.product_name',
                    'product.description_name',
                    'product.ar_product_name',
                    'product.ar_description_name',
                    'product.delievery_charge',
                    'product.product_price',
                    'product.product_unit',
                    'product.createdAt',
                    'product.category_id',
                    'category.category_name',
                    'category.ar_category_name',
                ])
                .orderBy('productRequest.createdAt', 'DESC')
                .skip(offset)
                .take(limit);
    
            // Add conditions dynamically
            if (status) {
                queryBuilder.andWhere('productRequest.status = :status', { status });
            }
    
            if (category_id) {
                queryBuilder.andWhere('product.category_id = :category_id', { category_id });
            }
    
            if (search) {
                queryBuilder.andWhere(
                    '(product.product_name LIKE :search COLLATE utf8mb4_general_ci OR product.ar_product_name LIKE :search COLLATE utf8mb4_general_ci)',
                    { search: `%${search}%` }
                );
            }
    
            // Execute the query
            const [pages, count] = await queryBuilder.getManyAndCount();
    
            // Format paginated data
            const paginatedData = CommonService.getPagingData(
                { count, rows: pages },
                page,
                limit
            );
    
            return paginatedData;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    

    // Get all ProductRequests with pagination and search
    async getUserAllPages(user_id: any, page: number = 1, pageSize: number = 10, search: string = '', status: string) {
        try {
            const { limit, offset } = CommonService.getPagination(page, pageSize);

            const whereCondition: any = { user_id: user_id };

            if (status) { whereCondition.status = status; }
            if (search) { whereCondition.user = { name: Like(`%${search}%`), }; }

            const [pages, count] = await this.ProductRequestModel.findAndCount({
                where: whereCondition,
                relations: ['user', 'product', 'product.category'],
                skip: offset,
                take: limit,
                select: {
                    user: { name: true, address_one: true, address_two: true },
                    product: { provider_type: true, product_img: true, product_name: true, description_name: true, ar_product_name: true, ar_description_name: true, delievery_charge: true, product_price: true, product_unit: true, createdAt: true, category_id: true, category: { category_name: true, ar_category_name: true } }
                },
                order: { createdAt: 'DESC' }
            });

            // Format paginated data
            const paginatedData = CommonService.getPagingData({ count, rows: pages }, page, limit);
            return paginatedData;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Get ProductRequest data by ID
    async getDatabyid(id: number) {
        try {
            const ProductRequest = await this.ProductRequestModel.findOne({
                where: { id: id },
                relations: ['user', 'product', 'product.category'],
                select: {
                    user: { name: true, address_one: true, address_two: true },
                    product: { provider_type: true, product_img: true, product_name: true, description_name: true, ar_product_name: true, ar_description_name: true, delievery_charge: true, product_price: true, product_unit: true, createdAt: true, category_id: true, category: { category_name: true, ar_category_name: true } }
                },
            });

            if (!ProductRequest) {
                throw new Error(CommonMessages.notFound('ProductRequest'));
            }

            return ProductRequest;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Create ProductRequest data
 
    async createData(data: any) {
        try {
            // Set the createdAt field to the current time in Saudi Arabia (Riyadh) timezone (GMT+3)
            data.createdAt = moment.tz('Asia/Riyadh').format('YYYY-MM-DD HH:mm:ss');
    
            // Create a new product request with the adjusted time
            let newProductRequest: any = await this.ProductRequestModel.create(data);
            newProductRequest = await this.ProductRequestModel.save(newProductRequest);
    
            return newProductRequest;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    

    // Update ProductRequest data
    async updateData(id: number, updateData: Partial<ProductRequest>) {
        try {
            let response = await this.ProductRequestModel.update(id, updateData);
            if (response[0] === 0) {
                throw new Error("No ProductRequest data was updated.");
            }
            return response
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Delete ProductRequest data
    async deleteData(id: number) {
        try {
            const ProductRequest = await this.ProductRequestModel.findOne({ where: { id: id } });

            if (!ProductRequest) {
                throw new Error(CommonMessages.notFound('ProductRequest'));
            }

            await this.ProductRequestModel.softDelete(id);
            return ProductRequest;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async bulkDeletedata(ids: number[]): Promise<number> {
        try {
            const categories = await this.ProductRequestModel.find({ where: { id: In(ids) } });

            if (categories.length === 0) {
                throw new Error(CommonMessages.notFound('Product'));
            }

            const result = await this.ProductRequestModel.softDelete(ids);

            return result.affected || 0;
        } catch (error) {
            throw new Error(error.message);
        }
    }

}
