import { ProductWishListService } from './provider_wishlist.service';
export declare class ProductWishController {
    private readonly ProductWishListService;
    constructor(ProductWishListService: ProductWishListService);
    createWishlist(createDto: any, req: any): Promise<{
        status: boolean;
        message: string;
        data: {
            message: string;
            action: string;
        };
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
    getList(req: any): Promise<{
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
    }>;
    reportProvider(createDto: any, req: any): Promise<{
        status: boolean;
        message: any;
    }>;
    reviewProvider(createDto: any, req: any): Promise<{
        status: boolean;
        message: string;
        data: {
            message: string;
            updated: boolean;
            created?: undefined;
        } | {
            message: string;
            created: boolean;
            updated?: undefined;
        };
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
}
