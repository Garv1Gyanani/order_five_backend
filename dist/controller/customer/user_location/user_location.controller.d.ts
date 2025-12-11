import { UserLocationService } from './user_location.service';
export declare class UserLocationController {
    private readonly UserLocationService;
    constructor(UserLocationService: UserLocationService);
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
        data: import("../../../schema/user_location.schema").User_location;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    createProfile(createDto: any, req: any): Promise<{
        status: boolean;
        message: string;
        data: import("../../../schema/user_location.schema").User_location[];
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    updateProfile(id: number, updateData: any): Promise<{
        status: boolean;
        message: string;
        data: import("../../../schema/user_location.schema").User_location;
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
