import { Repository } from 'typeorm';
import { Category } from 'src/schema/category.schema';
export declare class CategoryService {
    private readonly CategoryModel;
    constructor(CategoryModel: Repository<Category>);
    getData(id: number): Promise<Category>;
    getAll(provider_type: any): Promise<any[]>;
    private getCategoryHierarchy;
    getAllPages(page?: number, pageSize?: number, search?: string): Promise<{
        totalItems: number;
        data: any[];
        totalPages: number;
        currentPage: number;
    }>;
    getDatabyid(id: number): Promise<Category>;
    createData(data: any): Promise<any>;
    updateData(id: number, updateData: Partial<Category>): Promise<import("typeorm").UpdateResult>;
    deleteData(id: number): Promise<Category>;
    bulkDeletedata(ids: number[]): Promise<number>;
}
