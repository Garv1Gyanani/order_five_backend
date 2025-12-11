import { Repository } from 'typeorm';
import { CategoryRequest } from 'src/schema/category_request.schema';
import { Category } from 'src/schema/category.schema';
export declare class CategoryRequestService {
    private readonly CategoryRequestModel;
    private readonly CategoryModel;
    constructor(CategoryRequestModel: Repository<CategoryRequest>, CategoryModel: Repository<Category>);
    getData(id: number): Promise<Category>;
    getAllPages(page: number, pageSize: number, search: string, status: string, cattype: any): Promise<{
        totalItems: number;
        data: any[];
        totalPages: number;
        currentPage: number;
    }>;
    getDatabyid(id: number): Promise<CategoryRequest>;
    createData(data: any): Promise<any>;
    updateData(id: number, updateData: any): Promise<import("typeorm").UpdateResult>;
    deleteData(id: number): Promise<CategoryRequest>;
    getAll(): Promise<any[]>;
    private getCategoryHierarchy;
}
