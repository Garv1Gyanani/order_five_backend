// src/template/template.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Category } from 'src/schema/category.schema';
import * as bcrypt from 'bcrypt';
import CommonService from 'src/common/common.util';
import { OptionsMessage } from 'src/common/options';
import { CommonMessages } from 'src/common/common-messages';
import { or } from 'sequelize';

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
    private async getCategoryHierarchy(provider_type: any, parentId: number = null, visited: Set<number> = new Set()): Promise<any[]> {

        const categories = await this.CategoryModel.find({
            where: { is_active: true, provider_type, parent_category_id: parentId },
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
    async getAllPages(page: number = 1, pageSize: number = 10, search: string = '', cattype: any) {
        try {
            const { limit, offset } = CommonService.getPagination(page, pageSize);
    
            let wherequery: any = { is_active: true };
    
            if (search) {
                wherequery = [
                    { ...wherequery, category_name: Like(`%${search}%`) },
                    { ...wherequery, ar_category_name: Like(`%${search}%`) }
                ];
            }
    
            if (cattype) {
                if (Array.isArray(wherequery)) {
                    // If wherequery is an array (due to search), add provider_type to each condition
                    wherequery = wherequery.map(condition => ({
                        ...condition,
                        provider_type: cattype
                    }));
                } else {
                    // If wherequery is an object, add provider_type directly
                    wherequery.provider_type = cattype;
                }
            }
    
            const [pages, count] = await this.CategoryModel.findAndCount({
                where: wherequery,
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
    // async getAllPages(page: number = 1, pageSize: number = 10, search: string = '', cattype: any) {
    //     try {
    //         const { limit, offset } = CommonService.getPagination(page, pageSize);

    //         let wherequery: any = { is_active: true }
    //         if (search) {
    //             wherequery = {
    //                 ...wherequery,
    //                 or: [
    //                     { category_name: Like(`%${search}%`) },
    //                     { ar_category_name: Like(`%${search}%`) }
    //                 ]
    //             };
    //         }

    //         if (cattype) {
    //             wherequery.provider_type = cattype
    //         }

    //         const [pages, count] = await this.CategoryModel.findAndCount({
    //             where: wherequery,
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

}
