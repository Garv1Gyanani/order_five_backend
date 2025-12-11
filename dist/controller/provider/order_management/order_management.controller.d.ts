import { OrderService } from './order_management.service';
import { Order } from 'src/schema/order.schema';
import { Repository } from 'typeorm';
import { Notification } from 'src/schema/notification.schema';
import { User } from 'src/schema/user.schema';
export declare class OrderController {
    private readonly OrderService;
    private readonly Order;
    private readonly NotificationModel;
    private readonly User;
    constructor(OrderService: OrderService, Order: Repository<Order>, NotificationModel: Repository<Notification>, User: Repository<User>);
    getOrderCount(req: any): Promise<{
        status: boolean;
        message: string;
        data: {
            activeOrders: number;
            completedOrders: number;
        };
    } | {
        status: boolean;
        message: any;
    }>;
    getRecentOrder(req: any): Promise<{
        status: boolean;
        message: string;
        data: {
            providerDetails: User;
            productDetails: import("../../../schema/product.schema").Product;
            productChargeDetails: import("../../../schema/product_request.schema").ProductRequest;
            addressDetails: import("../../../schema/user_location.schema").User_location;
            customer: User;
            platform_charge: string;
            cancel_charge: string;
            customer_review_data: {
                provider_review: string;
                provider_rating: number;
                averageRating: number;
                totalReview: any;
            };
            provider_review_data: {
                customer_review: string;
                customer_rating: number;
                averageRating: number;
                totalReview: any;
            };
            timing: {
                distance: {
                    value: number;
                    formatted: string;
                };
                travelTime: {
                    value: number;
                    formatted: string;
                };
            };
            id: number;
            user_id: number;
            provider_id: number;
            address_id: number;
            product_id: number;
            order_id: string;
            distance: string;
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
        }[];
    } | {
        status: boolean;
        message: any;
    }>;
    getpayment(req: any, id: string): Promise<{
        status: boolean;
        message: string;
        data: import("../../../schema/wallet_req.schema").Wallet_req;
    } | {
        status: boolean;
        message: any;
    }>;
    getOrderList(req: any): Promise<{
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
    orderCancle(id: number, updateData: any): Promise<{
        status: boolean;
        message: string;
        data: import("typeorm").UpdateResult;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    orderACCEPT(id: number, updateData: any): Promise<{
        status: boolean;
        message: string;
        data: import("typeorm").UpdateResult;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    orderCompalate(id: number, updateData: any): Promise<{
        status: boolean;
        message: string;
        data: import("typeorm").UpdateResult;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
}
