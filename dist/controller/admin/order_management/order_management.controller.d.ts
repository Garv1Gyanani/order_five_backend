import { OrderService } from './order_management.service';
import { Order } from 'src/schema/order.schema';
import { Repository } from 'typeorm';
import { User } from 'src/schema/user.schema';
import { Product } from 'src/schema/product.schema';
import { ProductRequest } from 'src/schema/product_request.schema';
export declare class OrderController {
    private readonly OrderService;
    private readonly Order;
    private readonly UserRequestModel;
    private readonly ProductModel;
    private readonly ProductRequestModel;
    constructor(OrderService: OrderService, Order: Repository<Order>, UserRequestModel: Repository<User>, ProductModel: Repository<Product>, ProductRequestModel: Repository<ProductRequest>);
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
    OrderListById(id: number, req: any): Promise<{
        status: boolean;
        message: string;
        data: {
            customerDetails: User;
            providerDetails: User;
            productDetails: Product;
            productChargeDetails: ProductRequest;
            customerRating: number;
            ProviderRating: number;
            addressDetails: import("../../../schema/user_location.schema").User_location;
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
    } | {
        status: boolean;
        message: any;
    }>;
    getOrderListById(id: number, req: any): Promise<{
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
    getcstOrderListById(id: number, req: any): Promise<{
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
    orderCancle(id: number, updateData: {
        remark: string;
    }): Promise<{
        status: boolean;
        message: string;
        data: import("typeorm").UpdateResult;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    orderRemark(id: number, updateData: {
        remark: string;
    }): Promise<{
        status: boolean;
        message: string;
        data: import("typeorm").UpdateResult;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    orderAccept(id: number, updateData: {
        remark: string;
    }): Promise<{
        status: boolean;
        message: string;
        data: import("typeorm").UpdateResult;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    orderRemove(id: number): Promise<{
        status: boolean;
        message: string;
        data: import("typeorm").UpdateResult;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    bulkDeletedata(ids: number[]): Promise<{
        status: boolean;
        message: any;
    }>;
    exportOrderListToXLSX(req: any, res: any): Promise<any>;
}
