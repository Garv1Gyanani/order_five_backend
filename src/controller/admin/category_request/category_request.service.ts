// src/template/template.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Like, Repository } from 'typeorm';
import { CategoryRequest } from 'src/schema/category_request.schema';
import CommonService from 'src/common/common.util';
import { CommonMessages } from 'src/common/common-messages';
import * as moment from 'moment-timezone';

@Injectable()
export class CategoryRequestService {
    constructor(
        @InjectRepository(CategoryRequest)
        private readonly CategoryRequestModel: Repository<CategoryRequest>,
    ) { }

    // Get CategoryRequest data
    async getData(id: number) {
        try {
            const CategoryRequest = await this.CategoryRequestModel.findOne({ where: { id: id } });

            if (!CategoryRequest) {
                throw new Error(CommonMessages.notFound('CategoryRequest'));
            }
            return CategoryRequest;
        } catch (error) {
            throw new Error(error.message);
        }
    }


    async getAllPages(
        page: number = 1,
        pageSize: number = 10,
        search: string = '',
        status: string
    ) {
        try {
            const { limit, offset } = CommonService.getPagination(page, pageSize);

            const queryBuilder = this.CategoryRequestModel.createQueryBuilder('category');

            queryBuilder
                .leftJoinAndSelect('category.user', 'user')
                .leftJoinAndSelect('category.parent_category', 'parent_category');

            // Add status filter
            if (status) {
                queryBuilder.andWhere('category.status = :status', { status });
            }

            // Add search filter
            if (search) {
                queryBuilder.andWhere(
                    new Brackets((qb) => {
                        qb.where('user.name LIKE :search', { search: `%${search}%` })
                            .orWhere('category.category_name LIKE :search', { search: `%${search}%` })
                            .orWhere('category.ar_category_name LIKE :search', { search: `%${search}%` });
                    })
                );
            }

            // Add pagination
            queryBuilder.skip(offset).take(limit);

            // Add sorting
            queryBuilder.orderBy('category.createdAt', 'DESC');

            // Fetch data
            const [pages, count] = await queryBuilder.getManyAndCount();

            // Format and return paginated data
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



    // Get all CategoryRequests with pagination and search
    async getUserAllPages(id: any, page: number = 1, pageSize: number = 10, search: string = '', status: string) {
        try {
            const { limit, offset } = CommonService.getPagination(page, pageSize);

            const whereCondition: any = { user_id: id };

            if (status) {
                whereCondition.status = status;
            }

            if (search) {
                whereCondition.OR = [
                    { user: { name: Like(`%${search}%`) } },
                    { category_name: Like(`%${search}%`) },
                ];
            }

            // Find and count the records with pagination, join, and conditions
            const [pages, count] = await this.CategoryRequestModel.findAndCount({
                where: whereCondition,
                relations: ['user'], // Join with User entity to get user details
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

    // Get CategoryRequest data by ID
    async getDatabyid(id: number) {
        try {
            const CategoryRequest = await this.CategoryRequestModel.findOne({
                where: { id: id },
                relations: ['user', 'parent_category'],
                select: {
                    user: { name: true },
                    parent_category: { category_name: true, ar_category_name: true }
                },
            });

            if (!CategoryRequest) {
                throw new Error(CommonMessages.notFound('CategoryRequest'));
            }

            return CategoryRequest;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Create CategoryRequest data
    async createData(data: any) {
        try {
            // Set the createdAt field to the current time in Saudi Arabia (Riyadh) timezone (GMT+3)
            data.createdAt = moment.tz('Asia/Riyadh').format('YYYY-MM-DD HH:mm:ss');
    
            // Create a new category request with the adjusted time
            let newCategoryRequest: any = await this.CategoryRequestModel.create(data);
            newCategoryRequest = await this.CategoryRequestModel.save(newCategoryRequest);
    
            return newCategoryRequest;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Update CategoryRequest data
    async updateData(id: number, updateData: Partial<CategoryRequest>) {
        try {
            let response = await this.CategoryRequestModel.update(id, updateData);
            if (response[0] === 0) {
                throw new Error("No CategoryRequest data was updated.");
            }
            return response
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Delete CategoryRequest data
    async deleteData(id: number) {
        try {
            const CategoryRequest = await this.CategoryRequestModel.findOne({ where: { id: id } });

            if (!CategoryRequest) {
                throw new Error(CommonMessages.notFound('CategoryRequest'));
            }

            await this.CategoryRequestModel.softDelete(id);
            return CategoryRequest;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    //bulkDeletedata
    async bulkDeletedata(ids: number[]): Promise<number> {
        try {
            const categories = await this.CategoryRequestModel.find({ where: { id: In(ids) } });

            if (categories.length === 0) {
                throw new Error(CommonMessages.notFound('Categories'));
            }

            const result = await this.CategoryRequestModel.softDelete(ids);

            return result.affected || 0;
        } catch (error) {
            throw new Error(error.message);
        }
    }

}
