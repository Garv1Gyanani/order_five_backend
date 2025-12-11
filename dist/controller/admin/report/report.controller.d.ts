import { ReportService } from './report.service';
import { Repository } from 'typeorm';
import { Wallet_req } from 'src/schema/wallet_req.schema';
import { User } from 'src/schema/user.schema';
export declare class ReportController {
    private readonly ReportService;
    private readonly Wallet_req;
    private readonly User;
    constructor(ReportService: ReportService, Wallet_req: Repository<Wallet_req>, User: Repository<User>);
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
    updatedata(req: any, id: number, updateData: any): Promise<{
        status: boolean;
        message: string;
        data: {
            message: string;
            response: import("typeorm").UpdateResult;
        };
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    getreportcounts(req: any): Promise<{
        status: boolean;
        message: string;
        data: {
            offline: {
                count: number;
                totalAmount: any;
            };
            online: {
                count: number;
                totalAmount: any;
            };
            subscription: {
                count: number;
                totalAmount: any;
            };
            costPerOrder: {
                count: number;
                totalAmount: any;
            };
            unUsedBalance: {
                totalAmount: any;
                count: number;
            };
        };
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    IncomeReport(req: any): Promise<{
        status: boolean;
        message: string;
        data: {
            data: {
                totalItems: number;
                data: {
                    user: {
                        name: string;
                        phone_num: number;
                        image_url: string;
                    };
                    id: number;
                    user_id: number;
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
                }[];
                totalPages: number;
                currentPage: number;
            };
        };
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    exportIncomeReport(req: any, res: any): Promise<any>;
}
