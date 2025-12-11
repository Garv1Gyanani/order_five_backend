import { Repository } from 'typeorm';
import { CategoryRequest } from 'src/schema/category_request.schema';
export declare class CategoryRequestService {
    private readonly CategoryRequestModel;
    constructor(CategoryRequestModel: Repository<CategoryRequest>);
    getData(id: number): Promise<CategoryRequest>;
    getAllPages(page: number, pageSize: number, search: string, status: string): Promise<{
        totalItems: number;
        data: any[];
        totalPages: number;
        currentPage: number;
    }>;
    getUserAllPages(id: any, page: number, pageSize: number, search: string, status: string): Promise<{
        totalItems: number;
        data: any[];
        totalPages: number;
        currentPage: number;
    }>;
    getDatabyid(id: number): Promise<CategoryRequest>;
    createData(data: any): Promise<any>;
    updateData(id: number, updateData: Partial<CategoryRequest>): Promise<import("typeorm").UpdateResult>;
    deleteData(id: number): Promise<CategoryRequest>;
    bulkDeletedata(ids: number[]): Promise<number>;
}
