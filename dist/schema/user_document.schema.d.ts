import { Required_doc } from './required_doc.schema';
export declare class User_document {
    id: number;
    user_id: number;
    required_doc_id: number;
    required_doc: Required_doc;
    document: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
