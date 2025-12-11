import { Repository } from 'typeorm';
import { ProductRequest } from 'src/schema/product_request.schema';
export declare class ProductRequestService {
    private readonly ProductRequestModel;
    constructor(ProductRequestModel: Repository<ProductRequest>);
    getData(id: number): Promise<ProductRequest>;
    getAllPages(page: number, pageSize: number, search: string, status: string, category_id: any): Promise<{
        totalItems: number;
        data: any[];
        totalPages: number;
        currentPage: number;
    }>;
    getDatabyid(id: number): Promise<ProductRequest>;
    createData(data: any): Promise<any>;
    updateData(id: number, updateData: Partial<ProductRequest>): Promise<import("typeorm").UpdateResult>;
    deleteData(id: number): Promise<ProductRequest>;
}
