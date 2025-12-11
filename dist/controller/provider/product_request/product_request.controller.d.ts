import { ProductRequestService } from './product_request.service';
import { Repository } from 'typeorm';
import { User } from 'src/schema/user.schema';
import { Setting } from 'src/schema/setting.schema';
import { EmailTemplate } from 'src/schema/email_templates.schema';
import { Product } from 'src/schema/product.schema';
import { ProductRequest } from 'src/schema/product_request.schema';
export declare class ProductRequestController {
    private readonly ProductRequestService;
    private readonly UserModel;
    private readonly SettingModel;
    private readonly ProductRequestModel;
    private readonly ProductModel;
    private readonly EmailTemplateModel;
    constructor(ProductRequestService: ProductRequestService, UserModel: Repository<User>, SettingModel: Repository<Setting>, ProductRequestModel: Repository<ProductRequest>, ProductModel: Repository<Product>, EmailTemplateModel: Repository<EmailTemplate>);
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
    createdata(createDto: any, req: any): Promise<{
        status: boolean;
        message: string;
        data: any;
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
    updateProfile(id: number, updateData: any, req: any): Promise<{
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
    getAllList(req: any): Promise<{
        status: boolean;
        message: string;
        data: any[];
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
}
