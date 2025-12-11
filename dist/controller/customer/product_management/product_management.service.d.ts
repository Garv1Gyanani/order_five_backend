import { Repository } from 'typeorm';
import { Product } from 'src/schema/product.schema';
import { ProductRequest } from 'src/schema/product_request.schema';
export declare class ProductService {
    private readonly ProductModel;
    private readonly ProductRequestModel;
    constructor(ProductModel: Repository<Product>, ProductRequestModel: Repository<ProductRequest>);
    getData(id: number): Promise<Product>;
    getAllPages(page: number, pageSize: number, search: string, category_id: any, sort: any): Promise<any>;
    getDatabyid(id: number): Promise<Product>;
    createData(data: any): Promise<any>;
    updateData(id: number, updateData: Partial<Product>): Promise<import("typeorm").UpdateResult>;
    deleteData(id: number): Promise<Product>;
}
