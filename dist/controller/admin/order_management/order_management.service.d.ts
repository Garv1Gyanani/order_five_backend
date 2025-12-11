import { Repository } from 'typeorm';
import { Product } from 'src/schema/product.schema';
import { ProductRequest } from 'src/schema/product_request.schema';
import { User } from 'src/schema/user.schema';
import { User_location } from 'src/schema/user_location.schema';
import { Rating } from 'src/schema/rating.schema';
import { ProviderWishlist } from 'src/schema/wishlist.schema';
import { Order } from 'src/schema/order.schema';
import { Wallet_req } from 'src/schema/wallet_req.schema';
import { Setting } from 'src/schema/setting.schema';
export declare class OrderService {
    private readonly ProductModel;
    private readonly ProductRequestModel;
    private readonly UserRequestModel;
    private readonly UserLocationModel;
    private readonly RatingModel;
    private readonly WishlistModel;
    private readonly OrderModel;
    private readonly Wallet_req;
    private readonly Setting;
    constructor(ProductModel: Repository<Product>, ProductRequestModel: Repository<ProductRequest>, UserRequestModel: Repository<User>, UserLocationModel: Repository<User_location>, RatingModel: Repository<Rating>, WishlistModel: Repository<ProviderWishlist>, OrderModel: Repository<Order>, Wallet_req: Repository<Wallet_req>, Setting: Repository<Setting>);
    getOrderList(page: number, pageSize: number, search: string, status: any): Promise<{
        status: boolean;
        message: string;
        data: {
            totalItems: number;
            data: any[];
            totalPages: number;
            currentPage: number;
        };
    }>;
    private loadRoadData;
    private buildGraph;
    private calculateRoute;
    private formatDistance;
    private formatDuration;
    getOrderListById(page: number, pageSize: number, id: number): Promise<{
        status: boolean;
        message: string;
        data: {
            totalItems: number;
            data: any[];
            totalPages: number;
            currentPage: number;
        };
    }>;
    OrderListById(id: number): Promise<{
        status: boolean;
        message: string;
        data: {
            customerDetails: User;
            providerDetails: User;
            productDetails: Product;
            productChargeDetails: ProductRequest;
            customerRating: number;
            ProviderRating: number;
            addressDetails: User_location;
            platform_charge: string;
            distance: {
                value: number;
                formatted: string;
            };
            travelTime: {
                value: number;
                formatted: string;
            };
            id: number;
            user_id: number;
            provider_id: number;
            address_id: number;
            product_id: number;
            order_id: string;
            status: string;
            payment_type: string;
            totalprice: number;
            wallet: number;
            cash: number;
            remark: string;
            delivery_date: Date;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date;
        };
    }>;
    getcstOrderListById(page: number, pageSize: number, id: number): Promise<{
        status: boolean;
        message: string;
        data: {
            totalItems: number;
            data: any[];
            totalPages: number;
            currentPage: number;
        };
    }>;
    updateData(id: number, updateData: any): Promise<import("typeorm").UpdateResult>;
    bulkDeletedata(ids: number[]): Promise<number>;
}
