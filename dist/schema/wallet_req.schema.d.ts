import { User } from './user.schema';
export declare class Wallet_req {
    id: number;
    user_id: number;
    user: User;
    user_type: string;
    amount_status: string;
    wallet_type: string;
    transaction_id: string;
    currency: string;
    amount: number;
    available_amount: number;
    remark: string;
    order_type: string;
    date: Date;
    document_url: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    deleteAt: Date;
}
