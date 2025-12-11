// src/template/template.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { ProductRequest } from 'src/schema/product_request.schema';
import CommonService from 'src/common/common.util';
import { CommonMessages } from 'src/common/common-messages';

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
    async getAllPages(page: number = 1, pageSize: number = 10, search: string = '', status: string, category_id: any) {
        try {
            const { limit, offset } = CommonService.getPagination(page, pageSize);

            const whereCondition: any = { is_active: true };

            if (status) {
                whereCondition.status = status;
            }

            if (category_id) {
                whereCondition.product = { category_id };
            }

            if (search) {
                whereCondition.product = { product_name: Like(`%${search}%`), };
            }

            // Find and count the records with pagination, join, and conditions
            const [pages, count] = await this.ProductRequestModel.findAndCount({
                where: whereCondition,
                relations: ['user', 'product'],  // Join with User entity to get user details
                skip: offset,
                take: limit,
                select: {
                    user: { name: true } // Select specific fields from User
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
            const ProductRequest = await this.ProductRequestModel.findOne({ where: { id: id } });

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
            let newProductRequest: any = await this.ProductRequestModel.create(data);
            newProductRequest = await this.ProductRequestModel.save(newProductRequest)
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

}
