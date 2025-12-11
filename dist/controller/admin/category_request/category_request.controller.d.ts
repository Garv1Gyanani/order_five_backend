import { CategoryRequestService } from './category_request.service';
import { CategoryRequest } from 'src/schema/category_request.schema';
import { Repository } from 'typeorm';
import { Category } from 'src/schema/category.schema';
import { Notification } from 'src/schema/notification.schema';
import { User } from 'src/schema/user.schema';
export declare class CategoryRequestController {
    private readonly CategoryRequestService;
    private readonly CategoryModel;
    private readonly CategoryRequestModel;
    private readonly NotificationModel;
    private readonly User;
    constructor(CategoryRequestService: CategoryRequestService, CategoryModel: Repository<Category>, CategoryRequestModel: Repository<CategoryRequest>, NotificationModel: Repository<Notification>, User: Repository<User>);
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
    getuserList(req: any, id: number): Promise<{
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
        data: CategoryRequest;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    createdata(createDto: any, req: any): Promise<{
        status: boolean;
        message: string;
        data: any;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    updatedata(id: number, updateData: any, req: any): Promise<{
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
    exportListToXLSX(req: any, res: any): Promise<any>;
}
