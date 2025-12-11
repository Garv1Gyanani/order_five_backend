// src/template/template.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CategoryRequest } from 'src/schema/category_request.schema';
import CommonService from 'src/common/common.util';
import { CommonMessages } from 'src/common/common-messages';
import { Category } from 'src/schema/category.schema';
import * as moment from 'moment-timezone';

@Injectable()
export class CategoryRequestService {
    constructor(
        @InjectRepository(CategoryRequest)
        private readonly CategoryRequestModel: Repository<CategoryRequest>,
        @InjectRepository(Category)
        private readonly CategoryModel: Repository<Category>,
    ) { }

    // Get CategoryRequest data
    async getData(id: number) {
        try {
            const CategoryRequest = await this.CategoryModel.findOne({ where: { id: id } });

            if (!CategoryRequest) {
                throw new Error(CommonMessages.notFound('Category'));
            }
            return CategoryRequest;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    // async getData(id: number) {
    //     try {
    //         const CategoryRequest = await this.CategoryRequestModel.findOne({ where: { id: id } });

    //         if (!CategoryRequest) {
    //             throw new Error(CommonMessages.notFound('CategoryRequest'));
    //         }
    //         return CategoryRequest;
    //     } catch (error) {
    //         throw new Error(error.message);
    //     }
    // }

    // Get all CategoryRequests with pagination and search
    async getAllPages(page: number = 1, pageSize: number = 10, search: string = '', status: string, cattype: any) {
        try {
            const { limit, offset } = CommonService.getPagination(page, pageSize);

            const whereCondition: any = {};

            if (status) {
                whereCondition.status = status;
            }

            if (cattype) {
                whereCondition.provider_type = cattype;
            }

            if (search) {
                whereCondition.user = {
                    name: Like(`%${search}%`),
                };
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
            const CategoryRequest = await this.CategoryRequestModel.findOne({ where: { id: id } });

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
            data.createdAt = moment.tz('Asia/Riyadh').format('YYYY-MM-DD HH:mm:ss'); // Adding createdAt
            let newCategoryRequest: any = await this.CategoryRequestModel.create(data);
            newCategoryRequest = await this.CategoryRequestModel.save(newCategoryRequest);
            return newCategoryRequest;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    

    // Update CategoryRequest data
    async updateData(id: number, updateData: any) {
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

    // Get a list of Categories
    async getAll() {
        try {
            const categories = await this.getCategoryHierarchy();
            return categories;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    private async getCategoryHierarchy(parentId: number = null, visited: Set<number> = new Set()): Promise<any[]> {

        const categories = await this.CategoryModel.find({
            where: { parent_category_id: parentId },
            order: { id: "ASC" },
        });

        const categoryData = [];

        for (const category of categories) {
            if (visited.has(category.id)) continue;
            visited.add(category.id);
            const subcategories = await this.getCategoryHierarchy(category.id, visited);
            categoryData.push({
                id: category.id,
                ar_category_name: category.ar_category_name,
                category_name: category.category_name,
                subcategories: subcategories,
            });
        }

        return categoryData;
    }

}
