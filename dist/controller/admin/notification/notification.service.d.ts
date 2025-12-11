import { Repository } from 'typeorm';
import { Product } from 'src/schema/product.schema';
import { ProductRequest } from 'src/schema/product_request.schema';
import { User } from 'src/schema/user.schema';
import { User_location } from 'src/schema/user_location.schema';
import { Rating } from 'src/schema/rating.schema';
import { ProviderWishlist } from 'src/schema/wishlist.schema';
import { Notification } from 'src/schema/notification.schema';
import { Wallet_req } from 'src/schema/wallet_req.schema';
import { Setting } from 'src/schema/setting.schema';
export declare class NotificationService {
    private readonly ProductModel;
    private readonly ProductRequestModel;
    private readonly UserRequestModel;
    private readonly UserLocationModel;
    private readonly RatingModel;
    private readonly WishlistModel;
    private readonly NotificationModel;
    private readonly Wallet_req;
    private readonly Setting;
    constructor(ProductModel: Repository<Product>, ProductRequestModel: Repository<ProductRequest>, UserRequestModel: Repository<User>, UserLocationModel: Repository<User_location>, RatingModel: Repository<Rating>, WishlistModel: Repository<ProviderWishlist>, NotificationModel: Repository<Notification>, Wallet_req: Repository<Wallet_req>, Setting: Repository<Setting>);
    sendPushNotification(payload: {
        title: string;
        description: string;
        image: string;
        user_type: string;
    }): Promise<void>;
    getAllPages(page?: number, pageSize?: number, search?: string): Promise<{
        totalItems: number;
        data: any[];
        totalPages: number;
        currentPage: number;
    }>;
}
