import { Repository } from 'typeorm';
import { Category } from 'src/schema/category.schema';
export declare class CategoryService {
    private readonly CategoryModel;
    constructor(CategoryModel: Repository<Category>);
    getData(id: number): Promise<Category>;
    getAll(provider_type: any): Promise<any[]>;
    private getCategoryHierarchy;
    getAllPages(page: number, pageSize: number, search: string, cattype: any): Promise<{
        totalItems: number;
        data: any[];
        totalPages: number;
        currentPage: number;
    }>;
}
