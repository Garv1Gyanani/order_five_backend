import { WalletManagementService } from './wallet_management.service';
import { User } from 'src/schema/user.schema';
import { Repository } from 'typeorm';
import { Notification } from 'src/schema/notification.schema';
export declare class WalletManagementController {
    private readonly WalletManagementService;
    private readonly UserModel;
    private readonly NotificationModel;
    constructor(WalletManagementService: WalletManagementService, UserModel: Repository<User>, NotificationModel: Repository<Notification>);
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
    getUserList(req: any, id: number): Promise<{
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
        data: import("../../../schema/wallet_req.schema").Wallet_req;
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
    AcceptWalletReq(id: number): Promise<{
        status: boolean;
        message: string;
        data: import("typeorm").UpdateResult;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    RejectWalletReq(id: number): Promise<{
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
}
