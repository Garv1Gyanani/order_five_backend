// src/template/template.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Like, Repository } from 'typeorm';
import { Product } from 'src/schema/product.schema';
import * as bcrypt from 'bcrypt';
import CommonService from 'src/common/common.util';
import { OptionsMessage } from 'src/common/options';
import { CommonMessages } from 'src/common/common-messages';
import { ProductRequest } from 'src/schema/product_request.schema';

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(Product)
        private readonly ProductModel: Repository<Product>,
        @InjectRepository(ProductRequest)
        private readonly ProductRequestModel: Repository<ProductRequest>,
    ) { }

    // Get Product data
    async getData(id: number) {
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

    // Get all Products with pagination and search
    async getAllPages(page: number = 1, pageSize: number = 10, search: string = '', category_id: any, sort: any) {
        try {
            const { limit, offset } = CommonService.getPagination(page, pageSize);
    
            const queryBuilder = this.ProductModel.createQueryBuilder('product')
                .where('product.is_active = :is_active', { is_active: true });
    
            if (category_id) {
                queryBuilder.andWhere('product.category_id = :category_id', { category_id });
            }
    
            if (search) {
                queryBuilder.andWhere(
                    new Brackets((qb) => {
                        qb.where('product.product_name LIKE :search', { search: `%${search}%` })
                          .orWhere('product.ar_product_name LIKE :search', { search: `%${search}%` });
                    })
                );
            }
    
            let order: any = { createdAt: 'DESC' };
            if (sort == OptionsMessage.PRODUCT_SORT.price_high_to_low) {
                order = { product_price: 'DESC' };
            } else if (sort == OptionsMessage.PRODUCT_SORT.price_low_to_high) {
                order = { product_price: 'ASC' };
            } else if (sort == OptionsMessage.PRODUCT_SORT.newest) {
                order = { createdAt: 'DESC' };
            }
    
            queryBuilder.orderBy(order);
            queryBuilder.skip(offset).take(limit);
    
            const [pages, count] = await queryBuilder.getManyAndCount();
    
            let product_req_data: any = await this.ProductRequestModel.find({
                where: { status: OptionsMessage.PRODUCT_STATUS.Approved }
            });
            product_req_data = JSON.parse(JSON.stringify(product_req_data));
    
            // Filter out products that do not have a matching request in product_req_data
            const filteredPages = pages.filter((product) =>
                product_req_data.some((req) => req.product_id === product.id)
            );
    
            const filteredCount = filteredPages.length;
    
            const paginatedData: any = CommonService.getPagingData(
                { count: filteredCount, rows: filteredPages },
                page,
                limit
            );
    
            paginatedData.data = JSON.parse(JSON.stringify(paginatedData.data));
    
            for (let element of paginatedData.data) {
                let product_data = product_req_data.filter((o) => o.product_id == element.id);
                element.provider_available = product_data.length || 0;
            }
    
            return paginatedData;
        } catch (error) {
            throw new Error(error.message);
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
            let newProduct: any = await this.ProductModel.create(data);
            newProduct = await this.ProductModel.save(newProduct)
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

}
