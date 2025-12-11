// src/template/template.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { Category } from 'src/schema/category.schema';
import * as bcrypt from 'bcryptjs';
import CommonService from 'src/common/common.util';
import { OptionsMessage } from 'src/common/options';
import { CommonMessages } from 'src/common/common-messages';
import * as moment from 'moment-timezone';


@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category)
        private readonly CategoryModel: Repository<Category>,
    ) { }

    // Get Category data
    async getData(id: number) {
        try {
            const Category = await this.CategoryModel.findOne({ where: { id: id } });

            if (!Category) {
                throw new Error(CommonMessages.notFound('Category'));
            }
            return Category;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Get a list of Categories
    async getAll(provider_type: any) {
        try {
            const categories = await this.getCategoryHierarchy(provider_type);
            return categories;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    //
    private async getCategoryHierarchy(provider_type: any, parentId: number = null, visited: Set<number> = new Set(),): Promise<any[]> {

        const categories = await this.CategoryModel.find({
            where: { provider_type, parent_category_id: parentId },
            order: { id: "ASC" },
        });

        const categoryData = [];

        for (const category of categories) {
            if (visited.has(category.id)) continue;
            visited.add(category.id);
            const subcategories = await this.getCategoryHierarchy(provider_type, category.id, visited);
            categoryData.push({
                id: category.id,
                ar_category_name: category.ar_category_name,
                category_name: category.category_name,
                subcategories: subcategories,
            });
        }

        return categoryData;
    }

    // Get all Categorys with pagination and search
    async getAllPages(page: number = 1, pageSize: number = 10, search: string = '') {
        try {
            const { limit, offset } = CommonService.getPagination(page, pageSize);

            const queryBuilder = this.CategoryModel.createQueryBuilder('category');

            // Add search conditions if provided
            if (search) {
                queryBuilder.where(
                    `(category.category_name LIKE :search COLLATE utf8mb4_general_ci OR category.ar_category_name LIKE :search COLLATE utf8mb4_general_ci)`,
                    { search: `%${search}%` }
                );
            }

            // Pagination, ordering, and relations
            queryBuilder.skip(offset).take(limit).orderBy('category.createdAt', 'DESC');
            queryBuilder.leftJoinAndSelect('category.parent', 'parent');

            // Select fields
            queryBuilder.select([
                'category.id',
                'category.category_name',
                'category.ar_category_name',
                'category.provider_type',
                'category.category_img',
                'category.createdAt',
                'category.is_active',
                'parent.category_name',
                'parent.ar_category_name',
            ]);

            const [pages, count] = await queryBuilder.getManyAndCount();

            const paginatedData = CommonService.getPagingData({ count, rows: pages }, page, limit);
            return paginatedData;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Get Category data by ID
    async getDatabyid(id: number) {
        try {
            const Category = await this.CategoryModel.findOne({
                where: { id: id },
                relations: ['parent'],
                select: {
                    parent: { ar_category_name: true, category_name: true }
                },
            });

            if (!Category) {
                throw new Error(CommonMessages.notFound('Category'));
            }

            return Category;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Create Category data
    async createData(data: any) {
        try {
            // Get the current time in Saudi Arabia (Riyadh) timezone (GMT+3)
            data.createdAt = moment.tz('Asia/Riyadh').format('YYYY-MM-DD HH:mm:ss');

            // Create a new category with the adjusted time
            let newCategory: any = await this.CategoryModel.create(data);
            newCategory = await this.CategoryModel.save(newCategory);

            return newCategory;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    // Update Category data
    async updateData(id: number, updateData: Partial<Category>) {
        try {
            let response = await this.CategoryModel.update(id, updateData);
            if (response[0] === 0) {
                throw new Error("No Category data was updated.");
            }
            return response
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Delete Category data
    async deleteData(id: number) {
        try {
            const Category = await this.CategoryModel.findOne({ where: { id: id } });

            if (!Category) {
                throw new Error(CommonMessages.notFound('Category'));
            }

            await this.CategoryModel.softDelete(id);
            return Category;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async bulkDeletedata(ids: number[]): Promise<number> {
        try {
            const categories = await this.CategoryModel.find({ where: { id: In(ids) } });

            if (categories.length === 0) {
                throw new Error(CommonMessages.notFound('Categories'));
            }

            const result = await this.CategoryModel.softDelete(ids);

            return result.affected || 0;
        } catch (error) {
            throw new Error(error.message);
        }
    }

}
