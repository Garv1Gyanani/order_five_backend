import { SubscriptionService } from './subscription.service';
export declare class SubscriptionController {
    private readonly SubscriptionService;
    constructor(SubscriptionService: SubscriptionService);
    getList(req: any): Promise<{
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
    getbyId(id: number): Promise<{
        status: boolean;
        message: string;
        data: import("../../../schema/subscription.schema").Subscription;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    getDataByUserId(id: number): Promise<{
        status: boolean;
        message: string;
        data: {
            subscriptionDetails: import("../../../schema/subscription.schema").Subscription;
            ratingCount: number;
            ordersCount: number;
            averageRating: number;
            subscriptionOrder: {
                sub_status: string;
                user_name: any;
                id: number;
                user_id: number;
                subscription_id: number;
                amount: number;
                status: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date;
            }[];
            amount: number;
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
            password: string;
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
            productrequests: import("../../../schema/product_request.schema").ProductRequest[];
        };
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    createdata(createDto: any): Promise<{
        status: boolean;
        message: string;
        data: any;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    updatedata(id: number, updateData: any): Promise<{
        status: boolean;
        message: string;
        data: import("typeorm").UpdateResult;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    deletedata(id: number): Promise<{
        status: boolean;
        message: any;
    }>;
    bulkDeletedata(ids: number[]): Promise<{
        status: boolean;
        message: any;
    }>;
    getsubscriberList(req: any): Promise<{
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
    }>;
}
