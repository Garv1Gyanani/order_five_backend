import { SettingService } from './setting.service';
export declare class SettingController {
    private readonly SettingService;
    constructor(SettingService: SettingService);
    getkeyList(req: any): Promise<{
        status: boolean;
        message: string;
        data: import("../../../schema/setting.schema").Setting[];
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    getList(req: any): Promise<{
        status: boolean;
        message: string;
        data: import("../../../schema/setting.schema").Setting[];
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    getSettings(key: any): Promise<{
        status: boolean;
        message: string;
        data: import("../../../schema/setting.schema").Setting;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    updateSettings(req: any, body: any): Promise<{
        status: boolean;
        message: string;
        data: any[];
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
}
