import { Repository } from 'typeorm';
import { Required_doc } from '../../../schema/required_doc.schema';
export declare class Required_docService {
    private readonly Required_docModel;
    constructor(Required_docModel: Repository<Required_doc>);
    getList(): Promise<Required_doc[]>;
    getAllPages(page?: number, pageSize?: number, search?: string): Promise<{
        totalItems: number;
        data: any[];
        totalPages: number;
        currentPage: number;
    }>;
    getbyid(id: number): Promise<any>;
}
