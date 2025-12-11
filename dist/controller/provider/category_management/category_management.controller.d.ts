import { CategoryService } from './category_management.service';
export declare class CategoryController {
    private readonly CategoryService;
    constructor(CategoryService: CategoryService);
    getList(req: any): Promise<{
        status: boolean;
        message: string;
        data: {
            totalItems: number;
            data: import("../../../schema/category.schema").Category[];
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
    getAllList(req: any): Promise<{
        status: boolean;
        message: string;
        data: import("../../../schema/category.schema").Category[];
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
}
