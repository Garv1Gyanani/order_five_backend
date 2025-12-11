import { SubscriptionService } from './subscription.service';
import { User } from 'src/schema/user.schema';
import { Repository } from 'typeorm';
import { Subscription } from 'src/schema/subscription.schema';
import { SubscriptionOrder } from 'src/schema/subscription.orders.schema';
import { Wallet_req } from 'src/schema/wallet_req.schema';
export declare class SubscriptionController {
    private readonly SubscriptionService;
    private readonly UserModel;
    private readonly SubscriptionModel;
    private readonly SubscriptionOrder;
    private readonly WalletReqModel;
    constructor(SubscriptionService: SubscriptionService, UserModel: Repository<User>, SubscriptionModel: Repository<Subscription>, SubscriptionOrder: Repository<SubscriptionOrder>, WalletReqModel: Repository<Wallet_req>);
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
        data: Subscription;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    SubCreateOrder(createDto: any, req: any): Promise<{
        status: boolean;
        message: any;
    }>;
    SubCancelOrder(createDto: any, req: any): Promise<{
        status: boolean;
        message: any;
    }>;
}
