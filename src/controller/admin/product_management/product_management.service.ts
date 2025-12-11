// src/template/template.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { Product } from 'src/schema/product.schema';
import * as bcrypt from 'bcrypt';
import CommonService from 'src/common/common.util';
import { OptionsMessage } from 'src/common/options';
import { CommonMessages } from 'src/common/common-messages';
import { Category } from 'src/schema/category.schema';
import * as moment from 'moment-timezone';

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(Product)
        private readonly ProductModel: Repository<Product>,
        @InjectRepository(Category)
        private readonly CategoryModel: Repository<Category>,
    ) { }

    // Get Product data
    async getData(id: number) {
        try {
            const Product = await this.ProductModel.findOne({
                where: { id: id },
                relations: ['category'],
                select: {
                    category: { ar_category_name: true, category_name: true }
                },
            });

            if (!Product) {
                throw new Error(CommonMessages.notFound('Product'));
            }
            return Product;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Get all Products with pagination and search
    async getAllPages(page: number = 1, pageSize: number = 10, search: string = '') {
        try {
            const { limit, offset } = CommonService.getPagination(page, pageSize);
    
            // Initialize Query Builder for products
            const queryBuilder = this.ProductModel.createQueryBuilder('product')
                .select([
                    'product',
                    'product.product_name',
                    'product.provider_type',
                    'product.ar_product_name',
                    'product.description_name',
                    'product.ar_description_name',
                    'product.product_price',
                    'product.delievery_charge',
                    'product.delievery_address',
                    'product.product_img',
                    'product.product_unit',
                    'product.category_id',
                    'product.is_active',
                    'product.createdAt',
                    'product.updatedAt',
                ])
                .orderBy('product.createdAt', 'DESC') // Order by createdAt
                .skip(offset)
                .take(limit);
    
            // Execute query and fetch data
            const [pages, count] = await queryBuilder.getManyAndCount();
    
            // Fetch category details based on category_id
            const categoryIds = pages.map((product) => product.category_id);
            const categories = await this.CategoryModel.findByIds(categoryIds);
    
            // Fetch parent category details based on parent_category_id
            const parentCategoryIds = categories
                .filter((category) => category.parent_category_id)
                .map((category) => category.parent_category_id);
    
            const parentCategories = await this.CategoryModel.findByIds(parentCategoryIds);
    
            // Map categories and parent categories
            const productData = pages.map((product) => {
                const category = categories.find((category) => category.id === product.category_id) as Category | undefined;
                const parentCategory = parentCategories.find(
                    (parentCategory) => parentCategory.id === category?.parent_category_id
                );
    
                return {
                    ...product,
                    category: {
                        category_name: category?.category_name,
                        ar_category_name: category?.ar_category_name,
                    },
                    parent_category: parentCategory ? parentCategory.category_name : null,
                };
            });
    
            // Unified search for both product and category-level data
            let filteredData = productData;
            if (search) {
                filteredData = productData.filter((product) => {
                    const category = product.category || { category_name: '', ar_category_name: '' };
                    const parentCategory = product.parent_category || '';
    
                    // Check if values are not null or undefined before applying toLowerCase()
                    const productName = product.product_name?.toLowerCase() || '';
                    const arProductName = product.ar_product_name?.toLowerCase() || '';
                    const descriptionName = product.description_name?.toLowerCase() || '';
                    const arDescriptionName = product.ar_description_name?.toLowerCase() || '';
                    const providerType = product.provider_type?.toLowerCase() || '';
                    const categoryName = category.category_name?.toLowerCase() || '';
                    const arCategoryName = category.ar_category_name?.toLowerCase() || '';
                    const parentCategoryName = parentCategory.toLowerCase() || '';
    
                    return (
                        productName.includes(search.toLowerCase()) ||
                        arProductName.includes(search.toLowerCase()) ||
                        descriptionName.includes(search.toLowerCase()) ||
                        arDescriptionName.includes(search.toLowerCase()) ||
                        providerType.includes(search.toLowerCase()) ||
                        parentCategoryName.includes(search.toLowerCase()) ||
                        categoryName.includes(search.toLowerCase()) ||
                        arCategoryName.includes(search.toLowerCase())
                    );
                });
            }
    
            // Return the response with the filtered data
            return {
                totalItems: count,
                data: filteredData,  // Change from productData to filteredData
                totalPages: Math.ceil(count / pageSize),
                currentPage: page,
            };
        } catch (error) {
            console.error('Error fetching products:', error);
            throw new Error('Error fetching products');
        }
    }
    




    // Get Product data by ID
    async getDatabyid(id: number) {
        try {
            const Product = await this.ProductModel.findOne({ where: { id: id } });

            if (!Product) {
                throw new Error(CommonMessages.notFound('Product'));
            }

            return Product;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Create Product data
    
async createData(data: any) {
    try {
        // Set the createdAt field to the current time in Saudi Arabia (Riyadh) timezone (GMT+3)
        data.createdAt = moment.tz('Asia/Riyadh').format('YYYY-MM-DD HH:mm:ss');

        // Create a new product with the adjusted time
        let newProduct: any = await this.ProductModel.create(data);
        newProduct = await this.ProductModel.save(newProduct);

        return newProduct;
    } catch (error) {
        throw new Error(error.message);
    }
}

    // Update Product data
    async updateData(id: number, updateData: Partial<Product>) {
        try {
            let response = await this.ProductModel.update(id, updateData);
            if (response[0] === 0) {
                throw new Error("No Product data was updated.");
            }
            return response
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Delete Product data
    async deleteData(id: number) {
        try {
            const Product = await this.ProductModel.findOne({ where: { id: id } });

            if (!Product) {
                throw new Error(CommonMessages.notFound('Product'));
            }

            await this.ProductModel.softDelete(id);
            return Product;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async bulkDeletedata(ids: number[]): Promise<number> {
        try {
            const categories = await this.ProductModel.find({ where: { id: In(ids) } });

            if (categories.length === 0) {
                throw new Error(CommonMessages.notFound('Product'));
            }

            const result = await this.ProductModel.softDelete(ids);

            return result.affected || 0;
        } catch (error) {
            throw new Error(error.message);
        }
    }

}
