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
import { Notification } from 'src/schema/notification.schema';
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
    private readonly NotificationModel;
    constructor(ProductModel: Repository<Product>, ProductRequestModel: Repository<ProductRequest>, UserRequestModel: Repository<User>, UserLocationModel: Repository<User_location>, RatingModel: Repository<Rating>, WishlistModel: Repository<ProviderWishlist>, OrderModel: Repository<Order>, Wallet_req: Repository<Wallet_req>, Setting: Repository<Setting>, NotificationModel: Repository<Notification>);
    private loadRoadData;
    private buildGraph;
    private calculateRoute;
    private formatDistance;
    private formatDuration;
    private getAverageRatings;
    findNearbyProviders(productId: number, latitude: number, longitude: number, filter: number, rating: string | number, userLogid: number, s: string, page: number, size: number): Promise<any>;
    orderCreate(data: any): Promise<any>;
    createCashWalletData(data: any): Promise<any>;
    getOrderList(page: number, pageSize: number, search: string, user_id: any, productNameSearch?: string): Promise<{
        status: boolean;
        message: string;
        data: {
            totalItems: number;
            data: any[];
            totalPages: number;
            currentPage: number;
        };
    }>;
    getArrivalOrderList(page: number, pageSize: number, search: string, user_id: any, productNameSearch?: string): Promise<{
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
    getpayment(id: string): Promise<Wallet_req>;
}
