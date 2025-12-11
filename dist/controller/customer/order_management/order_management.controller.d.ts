import { OrderService } from './order_management.service';
import { Order } from 'src/schema/order.schema';
import { Repository } from 'typeorm';
import { User_location } from 'src/schema/user_location.schema';
import { User } from 'src/schema/user.schema';
import { Wallet_req } from 'src/schema/wallet_req.schema';
import { Setting } from 'src/schema/setting.schema';
import { Notification } from 'src/schema/notification.schema';
export declare class OrderController {
    private readonly OrderService;
    private readonly Order;
    private readonly User_location;
    private readonly User;
    private readonly Wallet_req;
    private readonly Setting;
    private readonly NotificationModel;
    constructor(OrderService: OrderService, Order: Repository<Order>, User_location: Repository<User_location>, User: Repository<User>, Wallet_req: Repository<Wallet_req>, Setting: Repository<Setting>, NotificationModel: Repository<Notification>);
    findNearbyProviders(body: any, req: any): Promise<any>;
    orderCreate(createDto: any, req: any): Promise<{
        status: boolean;
        message: string;
        data: any;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    createCashWalletData(createDto: any, req: any): Promise<{
        status: boolean;
        message: string;
        data: any;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
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
    getArrivalOrderList(req: any): Promise<{
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
    orderCancle(req: any, id: number, updateData: {
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
    private loadRoadData;
    private buildGraph;
    private calculateRoute;
    private formatDistance;
    private formatDuration;
    getOrderAddressDistance(body: any): Promise<{
        status: boolean;
        message: string;
        data: {
            userAddress: {
                latitude: string;
                longitude: string;
                address: string;
            };
            providerAddress: {
                latitude: string;
                longitude: string;
                address: string;
            };
            distance: {
                value: number;
                formatted: string;
            };
            travelTime: {
                value: number;
                formatted: string;
            };
        };
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    getpayment(req: any, id: string): Promise<{
        status: boolean;
        message: string;
        data: Wallet_req;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
}
