import { Repository } from 'typeorm';
import { Subscription } from 'src/schema/subscription.schema';
import { SubscriptionOrder } from 'src/schema/subscription.orders.schema';
export declare class SubscriptionService {
    private readonly SubscriptionModel;
    private readonly SubscriptionOrder;
    constructor(SubscriptionModel: Repository<Subscription>, SubscriptionOrder: Repository<SubscriptionOrder>);
    getAllPages(page?: number, pageSize?: number, search?: string): Promise<{
        totalItems: number;
        data: any[];
        totalPages: number;
        currentPage: number;
    }>;
    getData(id: number): Promise<Subscription>;
}
