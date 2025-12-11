// src/template/template.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Category } from 'src/schema/category.schema';
import * as bcrypt from 'bcrypt';
import CommonService from 'src/common/common.util';
import { OptionsMessage } from 'src/common/options';
import { CommonMessages } from 'src/common/common-messages';

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
    async getAll(cattype: any) {
        try {

            let whereCondition: any = { is_active: true }
            if (cattype) {
                whereCondition.provider_type = cattype;
            }

            const categories = await this.CategoryModel.find({
                where: whereCondition,
                // where: { parent_category_id: parentId },
                order: { id: "ASC" },
            });

            // const categories = await this.getCategoryHierarchy();
            return categories;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    //
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

    // Get all Categorys with pagination and search
    async getAllPages(page: number = 1, pageSize: number = 10, search: string = '', cattype: any) {
        try {
          const { limit, offset } = CommonService.getPagination(page, pageSize);
      
          // Initialize Query Builder
          const queryBuilder = this.CategoryModel.createQueryBuilder('category')
            .where('category.is_active = :isActive', { isActive: 1 }) // Base condition
            .orderBy('category.createdAt', 'DESC') // Order by creation date
            .skip(offset)
            .take(limit);
      
          // Apply filter for cattype if provided
          if (cattype) {
            queryBuilder.andWhere('category.provider_type = :providerType', { providerType: cattype });
          }
      
          // Apply search condition for `name` and `ar_category_name`
          if (search) {
            queryBuilder.andWhere(
              '(category.name LIKE :search COLLATE utf8mb4_general_ci OR category.ar_category_name LIKE :search COLLATE utf8mb4_general_ci)',
              { search: `%${search}%` }
            );
          }
           // Execute the query and get paginated results
          const [pages, count] = await queryBuilder.getManyAndCount();
      
          // Format the paginated response
          return {
            totalItems: count,
            data: pages,
            totalPages: Math.ceil(count / pageSize),
            currentPage: Number(page),
          };
        } catch (error) {
          console.error('Error fetching categories:', error);
          throw new Error(error.message);
        }
      }
      

    // Get Category data by ID
    async getDatabyid(id: number) {
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

    // Create Category data
    async createData(data: any) {
        try {
            let newCategory: any = await this.CategoryModel.create(data);
            newCategory = await this.CategoryModel.save(newCategory)
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

}
