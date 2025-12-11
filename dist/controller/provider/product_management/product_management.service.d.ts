import { Repository } from 'typeorm';
import { Product } from 'src/schema/product.schema';
export declare class ProductService {
    private readonly ProductModel;
    constructor(ProductModel: Repository<Product>);
    getData(id: number): Promise<Product>;
    getAllPages(page: number, pageSize: number, search: string, category_id: any): Promise<{
        totalItems: number;
        data: any[];
        totalPages: number;
        currentPage: number;
    }>;
    getDatabyid(id: number): Promise<Product>;
    createData(data: any): Promise<any>;
    updateData(id: number, updateData: Partial<Product>): Promise<import("typeorm").UpdateResult>;
    deleteData(id: number): Promise<Product>;
}
