import { Repository } from 'typeorm';
import { Setting } from 'src/schema/setting.schema';
export declare class SettingService {
    private readonly SettingModel;
    constructor(SettingModel: Repository<Setting>);
    getAllkeys(keys: string[]): Promise<Setting[]>;
    getAllPages(search: any): Promise<Setting[]>;
    getDatabyid(key: any): Promise<Setting>;
    updateData(key: string, updateData: Partial<Setting>): Promise<{
        id?: number;
        key: string;
        value?: string;
        title?: string;
        createdAt?: Date;
        updatedAt?: Date;
    }>;
}
