import { CategoryService } from './category_management.service';
import { Category } from 'src/schema/category.schema';
import { Repository } from 'typeorm';
import { CategoryRequest } from 'src/schema/category_request.schema';
export declare class CategoryController {
    private readonly CategoryService;
    private readonly CategoryModel;
    private readonly CategoryRequest;
    constructor(CategoryService: CategoryService, CategoryModel: Repository<Category>, CategoryRequest: Repository<CategoryRequest>);
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
        data: Category;
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
    getAllList(req: any): Promise<{
        status: boolean;
        message: string;
        data: any[];
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    exportListToXLSX(req: any, res: any): Promise<any>;
}
