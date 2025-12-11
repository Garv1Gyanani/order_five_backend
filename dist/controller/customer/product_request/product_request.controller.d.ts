import { ProductRequestService } from './product_request.service';
import { Repository } from 'typeorm';
import { Product } from 'src/schema/product.schema';
import { ProductRequest } from 'src/schema/product_request.schema';
export declare class ProductRequestController {
    private readonly ProductRequestService;
    private readonly ProductModel;
    private readonly ProductRequestModel;
    constructor(ProductRequestService: ProductRequestService, ProductModel: Repository<Product>, ProductRequestModel: Repository<ProductRequest>);
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
        data: ProductRequest;
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
    updateProfile2(id: number, updateData: any): Promise<{
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
    exportListToXLSX(req: any, res: any): Promise<any>;
}
