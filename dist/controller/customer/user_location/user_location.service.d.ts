import { Repository } from 'typeorm';
import { User_location } from 'src/schema/user_location.schema';
export declare class UserLocationService {
    private readonly UserLocationModel;
    constructor(UserLocationModel: Repository<User_location>);
    getAllPages(user_id: any, page?: number, pageSize?: number, search?: string): Promise<{
        totalItems: number;
        data: any[];
        totalPages: number;
        currentPage: number;
    }>;
    getData(id: number): Promise<User_location>;
    getDatabyid(id: number): Promise<User_location>;
    createData(data: any): Promise<User_location[]>;
    updateData(id: number, updateData: any): Promise<User_location>;
    deleteData(id: number): Promise<User_location>;
}
