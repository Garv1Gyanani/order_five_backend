import { ProductService } from './product_management.service';
import { Product } from 'src/schema/product.schema';
import { Repository } from 'typeorm';
import { Category } from 'src/schema/category.schema';
export declare class ProductController {
    private readonly ProductService;
    private readonly ProductModel;
    private readonly CategoryModel;
    constructor(ProductService: ProductService, ProductModel: Repository<Product>, CategoryModel: Repository<Category>);
    getList(req: any): Promise<{
        status: boolean;
        message: string;
        data: {
            totalItems: number;
            data: {
                category: {
                    category_name: string;
                    ar_category_name: string;
                };
                parent_category: string;
                id: number;
                provider_type: string;
                product_name: string;
                ar_product_name: string;
                additional_info: string;
                description_name: string;
                ar_description_name: string;
                product_price: number;
                delievery_charge: number;
                delievery_address: string;
                product_img: string;
                product_unit: string;
                category_id: number;
                is_active: boolean;
                product_req_id: number;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date;
                productdata: import("../../../schema/product_request.schema").ProductRequest[];
            }[];
            totalPages: number;
            currentPage: number;
        };
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    getbyId(id: number): Promise<{
        status: boolean;
        message: string;
        data: Product;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    createdata(createDto: any, req: any): Promise<{
        status: boolean;
        message: string;
        data: any;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    updatedata(id: number, updateData: any, req: any): Promise<{
        status: boolean;
        message: string;
        data: import("typeorm").UpdateResult;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    deletedata(id: number): Promise<{
        status: boolean;
        message: any;
    }>;
    bulkDeletedata(ids: number[]): Promise<{
        status: boolean;
        message: any;
    }>;
    exportProductsToXLSX(req: any, res: any): Promise<any>;
}
