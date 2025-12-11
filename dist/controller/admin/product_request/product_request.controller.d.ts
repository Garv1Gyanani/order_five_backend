import { ProductRequestService } from './product_request.service';
import { Repository } from 'typeorm';
import { Product } from 'src/schema/product.schema';
import { ProductRequest } from 'src/schema/product_request.schema';
import { Notification } from 'src/schema/notification.schema';
import { User } from 'src/schema/user.schema';
export declare class ProductRequestController {
    private readonly ProductRequestService;
    private readonly ProductModel;
    private readonly ProductRequestModel;
    private readonly NotificationModel;
    private readonly UserModel;
    constructor(ProductRequestService: ProductRequestService, ProductModel: Repository<Product>, ProductRequestModel: Repository<ProductRequest>, NotificationModel: Repository<Notification>, UserModel: Repository<User>);
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
        data: ProductRequest;
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
    updateActive(id: number, updateData: any, req: any): Promise<{
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
    exportAllPagesToXLSX(req: any, res: any): Promise<any>;
}
