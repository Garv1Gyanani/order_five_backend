import { User } from './user.schema';
import { Category } from './category.schema';
export declare class CategoryRequest {
    id: number;
    user_id: number;
    user: User;
    provider_type: string;
    category_name: string;
    category_img: string;
    ar_category_name: string;
    parent_category_id: number;
    parent_category: Category;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
