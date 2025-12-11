import { Repository } from 'typeorm';
import { Category } from 'src/schema/category.schema';
import { ProductRequest } from 'src/schema/product_request.schema';
export declare class ProductRequestService {
    private readonly ProductRequestModel;
    private readonly CategoryModel;
    constructor(ProductRequestModel: Repository<ProductRequest>, CategoryModel: Repository<Category>);
    getData(id: number): Promise<ProductRequest>;
    getAllPages(user_id: any, page: number, pageSize: number, search: string, status: string, cattype: any): Promise<{
        totalItems: number;
        data: any[];
        totalPages: number;
        currentPage: number;
    }>;
    getDatabyid(id: number): Promise<ProductRequest>;
    createData(data: any): Promise<any>;
    updateData(id: number, updateData: any): Promise<import("typeorm").UpdateResult>;
    deleteData(id: number): Promise<ProductRequest>;
    getAll(): Promise<any[]>;
    private getCategoryHierarchy;
}
