import { User } from './user.schema';
import { Product } from './product.schema';
export declare class ProductRequest {
    id: number;
    user_id: number;
    user: User;
    product_id: number;
    product: Product;
    product_price: number;
    delievery_charge: number;
    status: string;
    is_active: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
