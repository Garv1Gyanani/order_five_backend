import { CustomerService } from './customer.service';
import { User } from 'src/schema/user.schema';
import { Repository } from 'typeorm';
import { Rating } from 'src/schema/rating.schema';
export declare class CustomerController {
    private readonly userService;
    private readonly UserModel;
    private readonly RatingModel;
    constructor(userService: CustomerService, UserModel: Repository<User>, RatingModel: Repository<Rating>);
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
    getallList(req: any): Promise<{
        status: boolean;
        message: string;
        data: User[];
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    getbyId(id: number): Promise<{
        status: boolean;
        message: string;
        data: {
            orderCount: number;
            walletAmount: number;
            ReviewRating: number;
            rating: number;
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
    exportListToXLSX(req: any, res: any): Promise<any>;
}
