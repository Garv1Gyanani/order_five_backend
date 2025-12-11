import { UserService } from './provider.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    UserDocument(UserDocument: any, id: number): Promise<{
        status: boolean;
        message: string;
        data: any;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    MultiUploadDocument(req: any): Promise<{
        status: boolean;
        message: string;
        data: any[];
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    uploaddocument(UserDocument: any): Promise<{
        status: boolean;
        message: string;
        data: any;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    UpdateUserDocument(UserDocument: any, id: number): Promise<{
        status: boolean;
        message: string;
        data: any;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    getUserProfile(req: any): Promise<{
        status: boolean;
        message: string;
        data: any;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    updateUserProfile(id: number, updateData: any): Promise<{
        status: boolean;
        message: string;
        data: import("typeorm").UpdateResult;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    updateUserDataStatus(req: any, updateData: any): Promise<{
        status: boolean;
        message: string;
        data: import("typeorm").UpdateResult;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    uploadFiles(file: any): Promise<{
        status: boolean;
        message: string;
        url: string;
        data: any;
    } | {
        status: boolean;
        message: string;
        url?: undefined;
        data?: undefined;
    }>;
    reportCustomer(createDto: any, req: any): Promise<{
        status: boolean;
        message: any;
    }>;
    reviewCustomer(createDto: any, req: any): Promise<{
        status: boolean;
        message: string;
        data: {
            message: string;
            updated: boolean;
            created?: undefined;
        } | {
            message: string;
            created: boolean;
            updated?: undefined;
        };
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    getAllNotificationPages(req: any): Promise<{
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
}
