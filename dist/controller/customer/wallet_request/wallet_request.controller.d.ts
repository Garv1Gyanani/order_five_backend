import { WalletRequestService } from './wallet_request.service';
import { User } from 'src/schema/user.schema';
import { Repository } from 'typeorm';
export declare class WalletRequestController {
    private readonly WalletRequestService;
    private readonly UserModel;
    constructor(WalletRequestService: WalletRequestService, UserModel: Repository<User>);
    getList(req: any): Promise<{
        status: boolean;
        message: string;
        data: any;
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
    createProfile(createDto: any, req: any): Promise<{
        status: boolean;
        message: string;
        data: any;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    updateProfile(id: number, updateData: any): Promise<{
        status: boolean;
        message: string;
        data: import("typeorm").UpdateResult;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    deleteProfile(id: number): Promise<{
        status: boolean;
        message: any;
    }>;
}
