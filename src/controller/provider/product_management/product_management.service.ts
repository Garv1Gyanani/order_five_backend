// src/template/template.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Product } from 'src/schema/product.schema';
import * as bcrypt from 'bcrypt';
import CommonService from 'src/common/common.util';
import { OptionsMessage } from 'src/common/options';
import { CommonMessages } from 'src/common/common-messages';

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(Product)
        private readonly ProductModel: Repository<Product>,
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
    async getAllPages(page: number = 1, pageSize: number = 10, search: string = '', category_id: any) {
        try {
            const { limit, offset } = CommonService.getPagination(page, pageSize);

            let wherequery: any = { is_active: 1 }
            if (category_id) {
                wherequery.category_id = category_id
            }
            const [pages, count] = await this.ProductModel.findAndCount({
                where: wherequery,
                // where: { ...(search && { name: Like(`%${search}%`) }) },
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
