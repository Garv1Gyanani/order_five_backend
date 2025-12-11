// src/template/template.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import CommonService from 'src/common/common.util';
import { CommonMessages } from 'src/common/common-messages';
import { Category } from 'src/schema/category.schema';
import { ProductRequest } from 'src/schema/product_request.schema';
import * as moment from 'moment-timezone';

@Injectable()
export class ProductRequestService {
    constructor(
        @InjectRepository(ProductRequest)
        private readonly ProductRequestModel: Repository<ProductRequest>,
        @InjectRepository(Category)
        private readonly CategoryModel: Repository<Category>,
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
        user_id: any,
        page: number = 1,
        pageSize: number = 10,
        search: string = '',
        status: string,
        cattype: any
    ) {
        try {
            const { limit, offset } = CommonService.getPagination(page, pageSize);
    
            // Build where conditions for the query
            const whereCondition: any = { user_id, is_active: true };
    
            if (status && status !== '') {
                whereCondition.status = status;
            }
    
            if (cattype && cattype !== '') {
                whereCondition.product = { category_id: cattype };  // Check for product category
            }
    
            if (search && search !== '') {
                whereCondition.user = {
                    name: Like(`%${search}%`),
                };
            }
    
            // Fetch product requests with pagination, relations, and filters
            const [pages, count] = await this.ProductRequestModel.findAndCount({
                where: whereCondition,
                relations: ['user', 'product'],
                skip: offset,
                take: limit,
                select: {
                    user: { name: true },
                },
                order: { createdAt: 'DESC' },
            });
    
            // Filter out product requests where the related product has a non-null deletedAt
            const filteredPages = pages.filter((page) => {
                return page.product && page.product.deletedAt === null;
            });
    
            // Calculate the filtered count
            const filteredCount = filteredPages.length;
    
            // Apply pagination to the filtered data
            const paginatedData = CommonService.getPagingData(
                { count: filteredCount, rows: filteredPages },
                page,
                limit
            );
    
            return paginatedData;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    
    

    // Get ProductRequest data by ID
    async getDatabyid(id: number) {
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

    // Create ProductRequest data
    async createData(data: any) {
        try {
            data.createdAt = moment.tz('Asia/Riyadh').format('YYYY-MM-DD HH:mm:ss'); // Adding createdAt

            let newProductRequest: any = await this.ProductRequestModel.create(data);
            newProductRequest = await this.ProductRequestModel.save(newProductRequest)
            return newProductRequest;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Update ProductRequest data
    async updateData(id: number, updateData: any) {
        try {
            let response = await this.ProductRequestModel.update(id, updateData);
            if (response[0] === 0) {
                throw new Error("No ProductRequest data was updated.");
            }
            return response
        } catch (error) {
            console.log(error)
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
