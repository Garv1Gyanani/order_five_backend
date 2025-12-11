import { ProviderService } from './provider.service';
import { User_document } from 'src/schema/user_document.schema';
import { Repository } from 'typeorm';
import { User } from 'src/schema/user.schema';
import { EmailTemplate } from 'src/schema/email_templates.schema';
import { Required_doc } from 'src/schema/required_doc.schema';
import { Notification } from 'src/schema/notification.schema';
import { Rating } from 'src/schema/rating.schema';
import { Order } from 'src/schema/order.schema';
import { Wallet_req } from 'src/schema/wallet_req.schema';
import { Subscription } from 'src/schema/subscription.schema';
export declare class ProviderController {
    private readonly ProviderService;
    private readonly UserModel;
    private readonly Required_docModel;
    private readonly EmailTemplateModel;
    private readonly UserDocumentModel;
    private readonly NotificationModel;
    private readonly Order;
    private readonly RatingModel;
    private readonly wallet_req;
    private readonly SubscriptionModel;
    constructor(ProviderService: ProviderService, UserModel: Repository<User>, Required_docModel: Repository<Required_doc>, EmailTemplateModel: Repository<EmailTemplate>, UserDocumentModel: Repository<User_document>, NotificationModel: Repository<Notification>, Order: Repository<Order>, RatingModel: Repository<Rating>, wallet_req: Repository<Wallet_req>, SubscriptionModel: Repository<Subscription>);
    getUserList(req: any): Promise<{
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
    getAllprovider(req: any): Promise<{
        status: boolean;
        message: string;
        data: {
            id: number;
            name: string;
        }[];
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    getAllUsers(req: any): Promise<{
        status: boolean;
        message: string;
        data: {
            id: number;
            name: string;
        }[];
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    getUserbyId(id: number): Promise<{
        status: boolean;
        message: string;
        data: any;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    createUserdata(createUserDto: any): Promise<{
        status: boolean;
        message: string;
        data: any;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    updateUserdata(id: number, updateData: any): Promise<{
        status: boolean;
        message: string;
        data: import("typeorm").UpdateResult;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    deleteUserdata(id: number): Promise<{
        status: boolean;
        message: any;
    }>;
    bulkDeletedata(ids: number[]): Promise<{
        status: boolean;
        message: any;
    }>;
    exportListToXLSX(req: any, res: any): Promise<any>;
    UserDocument(UserDocument: any, id: number): Promise<{
        status: boolean;
        message: string;
        data: any[];
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    uploaddocument(UserDocument: any): Promise<{
        status: boolean;
        message: string;
        data: any;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    UpdateUserDocument(UserDocument: any, id: number): Promise<{
        status: boolean;
        message: string;
        data: any;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    changePassword(req: any): Promise<{
        status: boolean;
        message: string;
        data: User;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    getUserProfile(req: any): Promise<{
        status: boolean;
        message: string;
        data: {
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
            walletRequests: Wallet_req[];
            categoryrequests: import("../../../schema/category_request.schema").CategoryRequest[];
            productrequests: import("../../../schema/product_request.schema").ProductRequest[];
        };
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
}
