import { Product } from 'src/schema/product.schema';
import { Category } from 'src/schema/category.schema';
import { User } from 'src/schema/user.schema';
import { Repository } from 'typeorm';
import { ProductRequest } from 'src/schema/product_request.schema';
import { CategoryRequest } from 'src/schema/category_request.schema';
import { User_document } from 'src/schema/user_document.schema';
import { Wallet_req } from 'src/schema/wallet_req.schema';
import { Rating } from 'src/schema/rating.schema';
import { Report } from 'src/schema/report.schema';
export declare class DashboardController {
    private readonly UserModel;
    private readonly ProductModel;
    private readonly CategoryModel;
    private readonly ProductRequestModel;
    private readonly CategoryRequestModel;
    private readonly UserDocumentModel;
    private readonly WalletReqModel;
    private readonly Rating;
    private readonly Report;
    constructor(UserModel: Repository<User>, ProductModel: Repository<Product>, CategoryModel: Repository<Category>, ProductRequestModel: Repository<ProductRequest>, CategoryRequestModel: Repository<CategoryRequest>, UserDocumentModel: Repository<User_document>, WalletReqModel: Repository<Wallet_req>, Rating: Repository<Rating>, Report: Repository<Report>);
    getList(req: any): Promise<{
        status: boolean;
        message: string;
        data: {
            requested_product: number;
            requested_categorys: number;
            payment_approvals: number;
            provider_doc: number;
        };
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    getSecondboxList(req: any): Promise<{
        status: boolean;
        message: string;
        data: {
            total_provider: number;
            total_customer: number;
            total_product: number;
            total_category: number;
            report_of_misuse: number;
            customer_wallet_amount: any;
            provider_wallet_amount: any;
        };
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
}
