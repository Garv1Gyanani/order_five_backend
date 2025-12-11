import { Required_docService } from './required_doc.service';
export declare class Required_docController {
    private readonly Required_docService;
    constructor(Required_docService: Required_docService);
    getRequired_docList(req: any): Promise<{
        status: boolean;
        message: string;
        data: {
            totalItems: number;
            data: any[];
            totalPages: number;
            currentPage: number;
        };
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    getAllRequireddocList(req: any): Promise<{
        status: boolean;
        message: string;
        data: import("../../../schema/required_doc.schema").Required_doc[];
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    getRequired_docbyId(id: number): Promise<{
        status: boolean;
        message: string;
        data: import("../../../schema/required_doc.schema").Required_doc;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    createdata(req: any, createRequired_docDto: any): Promise<{
        status: boolean;
        message: string;
        data: any;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    updatedata(req: any, id: number, updateData: any): Promise<{
        status: boolean;
        message: string;
        data: import("typeorm").UpdateResult;
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    deletedata(id: number): Promise<{
        status: boolean;
        message: any;
    }>;
    bulkDeletedata(ids: number[]): Promise<{
        status: boolean;
        message: any;
    }>;
}
