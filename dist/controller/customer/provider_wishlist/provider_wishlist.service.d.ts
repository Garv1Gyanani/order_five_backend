import { Repository } from 'typeorm';
import { ProviderWishlist } from 'src/schema/wishlist.schema';
import { User } from 'src/schema/user.schema';
import { Rating } from 'src/schema/rating.schema';
import { Report } from 'src/schema/report.schema';
import { Notification } from 'src/schema/notification.schema';
export declare class ProductWishListService {
    private readonly ProviderWishlist;
    private readonly Report;
    private readonly User;
    private readonly Rating;
    private readonly NotificationModel;
    constructor(ProviderWishlist: Repository<ProviderWishlist>, Report: Repository<Report>, User: Repository<User>, Rating: Repository<Rating>, NotificationModel: Repository<Notification>);
    createData(data: any): Promise<{
        message: string;
        action: string;
    }>;
    getAllPages(page: number, pageSize: number, search: string, user_id: any): Promise<{
        status: boolean;
        message: string;
        data: {
            totalItems: number;
            data: any[];
            totalPages: number;
            currentPage: number;
        };
    }>;
    reportProvider(data: any): Promise<{
        status: boolean;
        message: string;
    }>;
    reviewProvider(data: any): Promise<{
        message: string;
        updated: boolean;
        created?: undefined;
    } | {
        message: string;
        created: boolean;
        updated?: undefined;
    }>;
}
