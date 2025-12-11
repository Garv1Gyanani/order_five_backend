import { CategoryRequestService } from './category_request.service';
import { Repository } from 'typeorm';
import { User } from 'src/schema/user.schema';
import { Setting } from 'src/schema/setting.schema';
import { EmailTemplate } from 'src/schema/email_templates.schema';
export declare class CategoryRequestController {
    private readonly CategoryReqService;
    private readonly UserModel;
    private readonly SettingModel;
    private readonly EmailTemplateModel;
    constructor(CategoryReqService: CategoryRequestService, UserModel: Repository<User>, SettingModel: Repository<Setting>, EmailTemplateModel: Repository<EmailTemplate>);
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
        data: import("../../../schema/category.schema").Category;
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
    updateProfile(req: any, id: number, updateData: any): Promise<{
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
