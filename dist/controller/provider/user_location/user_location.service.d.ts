import { Repository } from 'typeorm';
import { User_location } from 'src/schema/user_location.schema';
export declare class UserLocationService {
    private readonly UserLocationModel;
    constructor(UserLocationModel: Repository<User_location>);
    getAllPages(user_id: any): Promise<User_location>;
    getData(id: number): Promise<User_location>;
    getDatabyid(id: number): Promise<User_location>;
    createOrUpdateData(data: any, user_id: any): Promise<User_location | User_location[]>;
}
