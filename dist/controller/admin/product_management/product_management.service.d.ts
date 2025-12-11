import { Repository } from 'typeorm';
import { Product } from 'src/schema/product.schema';
import { Category } from 'src/schema/category.schema';
export declare class ProductService {
    private readonly ProductModel;
    private readonly CategoryModel;
    constructor(ProductModel: Repository<Product>, CategoryModel: Repository<Category>);
    getData(id: number): Promise<Product>;
    getAllPages(page?: number, pageSize?: number, search?: string): Promise<{
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
    }>;
    getDatabyid(id: number): Promise<Product>;
    createData(data: any): Promise<any>;
    updateData(id: number, updateData: Partial<Product>): Promise<import("typeorm").UpdateResult>;
    deleteData(id: number): Promise<Product>;
    bulkDeletedata(ids: number[]): Promise<number>;
}
