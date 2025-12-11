import { Repository } from 'typeorm';
import { Wallet_req } from 'src/schema/wallet_req.schema';
export declare class WalletManagementService {
    private readonly WalletManagementModel;
    constructor(WalletManagementModel: Repository<Wallet_req>);
    getAllPages(page: number, pageSize: number, search: string, status: string): Promise<{
        totalItems: number;
        data: any[];
        totalPages: number;
        currentPage: number;
    }>;
    getUserAllPages(user_id: any, page: number, pageSize: number, search: string, status: string): Promise<{
        totalItems: number;
        data: any[];
        totalPages: number;
        currentPage: number;
    }>;
    getData(id: number): Promise<Wallet_req>;
    getDatabyid(id: number): Promise<Wallet_req>;
    createData(data: any): Promise<any>;
    updateData(id: number, updateData: any): Promise<import("typeorm").UpdateResult>;
    deleteData(id: number): Promise<Wallet_req>;
    bulkDeletedata(ids: number[]): Promise<number>;
}
