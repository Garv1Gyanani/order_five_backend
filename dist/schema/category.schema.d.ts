import { Product } from './product.schema';
import { CategoryRequest } from './category_request.schema';
export declare class Category {
    id: number;
    provider_type: string;
    category_name: string;
    category_img: string;
    ar_category_name: string;
    parent_category_id: number;
    is_active: boolean;
    category_req_id: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    parent: Category;
    children: Category[];
    categorydata: Product[];
    parentcategorydata: CategoryRequest[];
}
