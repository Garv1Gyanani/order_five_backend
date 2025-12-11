import { ProductRequest } from './product_request.schema';
import { Category } from './category.schema';
export declare class Product {
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
    category: Category;
    is_active: boolean;
    product_req_id: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    productdata: ProductRequest[];
}
