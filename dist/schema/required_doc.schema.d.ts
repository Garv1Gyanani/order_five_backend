import { User_document } from './user_document.schema';
export declare class Required_doc {
    id: number;
    title: string;
    ar_title: string;
    type: string;
    is_active: boolean;
    is_required: boolean;
    custom_fields: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    userdocumentrequests: User_document[];
}
