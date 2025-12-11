export declare class Order {
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
}
