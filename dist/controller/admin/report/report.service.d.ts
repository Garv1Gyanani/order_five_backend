import { Repository } from 'typeorm';
import { Report } from 'src/schema/report.schema';
import { User } from 'src/schema/user.schema';
export declare class ReportService {
    private readonly ReportModel;
    private readonly UserModel;
    constructor(ReportModel: Repository<Report>, UserModel: Repository<User>);
    getAllPages(page?: number, pageSize?: number, search?: string): Promise<{
        totalItems: number;
        data: any[];
        totalPages: number;
        currentPage: number;
    }>;
    updateData(id: number, block_day: number, is_pr_block: boolean): Promise<{
        message: string;
        response: import("typeorm").UpdateResult;
    }>;
}
