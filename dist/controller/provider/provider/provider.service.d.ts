import { Repository } from 'typeorm';
import { User } from 'src/schema/user.schema';
import { User_document } from 'src/schema/user_document.schema';
import { Report } from 'src/schema/report.schema';
import { Rating } from 'src/schema/rating.schema';
import { Notification } from 'src/schema/notification.schema';
import { Subscription } from 'src/schema/subscription.schema';
import { ProductRequest } from 'src/schema/product_request.schema';
import { Product } from 'src/schema/product.schema';
import { Wallet_req } from 'src/schema/wallet_req.schema';
export declare class UserService {
    private readonly UserModel;
    private readonly UserDocumentModel;
    private readonly Report;
    private readonly Rating;
    private readonly NotificationModel;
    private readonly Subscription;
    private readonly ProductReq;
    private readonly product;
    private readonly wallet_req;
    constructor(UserModel: Repository<User>, UserDocumentModel: Repository<User_document>, Report: Repository<Report>, Rating: Repository<Rating>, NotificationModel: Repository<Notification>, Subscription: Repository<Subscription>, ProductReq: Repository<ProductRequest>, product: Repository<Product>, wallet_req: Repository<Wallet_req>);
    getUserData(id: number): Promise<any>;
    getUserList(): Promise<User[]>;
    getAllPages(page?: number, pageSize?: number, search?: string): Promise<{
        totalItems: number;
        data: any[];
        totalPages: number;
        currentPage: number;
    }>;
    createUserData(data: any): Promise<any>;
    updateUserData(id: number, updateData: Partial<User>): Promise<import("typeorm").UpdateResult>;
    updateUserDataStatus(user_id: number, updateData: Partial<User>): Promise<import("typeorm").UpdateResult>;
    deleteUserData(id: number): Promise<User>;
    createMultiUserDocument(documents: any[], is_resubmit: any, user_id: any): Promise<any[]>;
    createUserDocument(data: any): Promise<any>;
    GetUserDocument(user_id: any): Promise<any>;
    UpdateUserDocument(id: any, data: any): Promise<any>;
    changePassword(id: number, currentPassword: string, newPassword: string, confirmPassword: string): Promise<User>;
    reportCustomer(data: any): Promise<{
        status: boolean;
        message: string;
    }>;
    reviewCustomer(data: any): Promise<{
        message: string;
        updated: boolean;
        created?: undefined;
    } | {
        message: string;
        created: boolean;
        updated?: undefined;
    }>;
    getAllNotificationPages(provider: number, page?: number, pageSize?: number, search?: string): Promise<{
        totalItems: number;
        data: any[];
        totalPages: number;
        currentPage: number;
    }>;
}
