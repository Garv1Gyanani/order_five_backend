import { CustomerService } from './customer.service';
import { Product } from 'src/schema/product.schema';
import { Repository } from 'typeorm';
import { Category } from 'src/schema/category.schema';
import { ProductRequest } from 'src/schema/product_request.schema';
import { Notification } from 'src/schema/notification.schema';
export declare class CustomerController {
    private readonly customerService;
    private readonly ProductModel;
    private readonly CategoryModel;
    private readonly ProductRequestModel;
    private readonly NotificationService;
    constructor(customerService: CustomerService, ProductModel: Repository<Product>, CategoryModel: Repository<Category>, ProductRequestModel: Repository<ProductRequest>, NotificationService: Repository<Notification>);
    CustomerDocument(CustomerDocument: any, id: number): Promise<{
        status: boolean;
        message: string;
        data: any;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    uploaddocument(CustomerDocument: any): Promise<{
        status: boolean;
        message: string;
        data: any;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    UpdateCustomerDocument(CustomerDocument: any, id: number): Promise<{
        status: boolean;
        message: string;
        data: any;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    getCustomerProfile(req: any): Promise<{
        status: boolean;
        message: string;
        data: {
            totalRatings: number;
            averageRating: string;
            id: number;
            image_url: string;
            name: string;
            dialing_code: number;
            remark: string;
            device_token: string;
            status: string;
            wallet_balance: number;
            address_one: string;
            address_two: string;
            phone_num: number;
            email: string;
            id_number: string;
            vehical_name: string;
            provider_profile: boolean;
            vehical_plat_num: string;
            custom_fields: string;
            reset_password_token: string;
            user_role: number;
            is_active: boolean;
            current_status: boolean;
            is_block: boolean;
            is_pr_block: boolean;
            block_date: Date;
            block_day: number;
            subscription_id: number;
            expiry_date: Date;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date;
            walletRequests: import("../../../schema/wallet_req.schema").Wallet_req[];
            categoryrequests: import("../../../schema/category_request.schema").CategoryRequest[];
            productrequests: ProductRequest[];
        };
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    updateCustomerProfile(id: number, updateData: any): Promise<{
        status: boolean;
        message: string;
        data: import("typeorm").UpdateResult;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    uploadFiles(file: any): Promise<{
        status: boolean;
        message: string;
        url: string;
        data: any;
    } | {
        status: boolean;
        message: string;
        url?: undefined;
        data?: undefined;
    }>;
    GlobelSearch(req: any): Promise<{
        status: boolean;
        message: string;
        data: {
            product_data: any;
            category_data: any;
            random_category: Category[];
        };
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    getAllNotificationPages(req: any): Promise<{
        status: boolean;
        message: string;
        data: {
            totalItems: number;
            data: any[];
            totalPages: number;
            currentPage: number;
        };
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
}
