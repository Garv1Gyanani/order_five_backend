
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CommonMessages } from 'src/common/common-messages';
import { AdminGuard } from 'src/authGuard/admin.guard';
import { OptionsMessage } from 'src/common/options';
import { Product } from 'src/schema/product.schema';
import { Category } from 'src/schema/category.schema';
import { User } from 'src/schema/user.schema';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ProductRequest } from 'src/schema/product_request.schema';
import { CategoryRequest } from 'src/schema/category_request.schema';
import { User_document } from 'src/schema/user_document.schema';
import { Wallet_req } from 'src/schema/wallet_req.schema';
import { Rating } from 'src/schema/rating.schema';
import { Report } from 'src/schema/report.schema';


@Controller('/dashboard')
@UseGuards(AdminGuard)
export class DashboardController {
    constructor(
        @InjectRepository(User)
        private readonly UserModel: Repository<User>,
        @InjectRepository(Product)
        private readonly ProductModel: Repository<Product>,
        @InjectRepository(Category)
        private readonly CategoryModel: Repository<Category>,
        @InjectRepository(ProductRequest)
        private readonly ProductRequestModel: Repository<ProductRequest>,
        @InjectRepository(CategoryRequest)
        private readonly CategoryRequestModel: Repository<CategoryRequest>,
        @InjectRepository(User_document)
        private readonly UserDocumentModel: Repository<User_document>,
        @InjectRepository(Wallet_req)
        private readonly WalletReqModel: Repository<Wallet_req>,
        @InjectRepository(Rating)
        private readonly Rating: Repository<Rating>,
        @InjectRepository(Report)
        private readonly Report: Repository<Report>,
    ) { }


    @Get('getcounts')
    async getList(@Req() req: any) {
        try {
            let CategoryRequest = await this.CategoryRequestModel.count({ where: { status: OptionsMessage.CATEGORY_STATUS.Requested } })
            let ProductRequest = await this.ProductRequestModel.count({ where: { status: OptionsMessage.PRODUCT_STATUS.Requested } })
            const userDocuments = await this.UserDocumentModel.find({
                where: { status: OptionsMessage.USER_DOCUMENT.Requested },
                select: ['user_id']
            });

            const userPendingCount = await this.UserModel.count({
                where: { status: 'Pending' }
             });
            // Extract unique user IDs
            const uniqueUserIds = [...new Set(userDocuments.map(doc => doc.user_id))];

            let WalletReqRequest = await this.WalletReqModel.count({ where: { status: OptionsMessage.WALLET_STATUS.Requested } })
            // let WalletReqRequest = await this.WalletReqModel.count({})

            let response = {
                requested_product: ProductRequest,
                requested_categorys: CategoryRequest,
                payment_approvals: WalletReqRequest,
                provider_doc: userPendingCount
            }
            return { status: true, message: CommonMessages.GET_LIST('Dashboard'), data: response };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Get('getsecondboxcounts')
    async getSecondboxList(@Req() req: any) {
        try {
            let { start_date, end_date }: any = req.query;

            // Parse dates if provided, default to null if not
            const startDate = start_date ? new Date(start_date) : null;
            const endDate = end_date ? new Date(end_date) : null;

            // If both dates are provided, apply the BETWEEN condition
            const dateFilter = startDate && endDate
                ? { createdAt: Between(startDate, endDate) }
                : {};

            const total_product = await this.ProductModel.count({ where: dateFilter });
            const total_category = await this.CategoryModel.count({ where: dateFilter });
            const total_provider = await this.UserModel.count({ where: { user_role: OptionsMessage.USER_ROLE.PROVIDER, ...dateFilter, }, });
            const total_customer = await this.UserModel.count({ where: { user_role: OptionsMessage.USER_ROLE.CUSTOMER, ...dateFilter, }, });
            const missuseReport = await this.Report.count({ where: { ...dateFilter, }, });
            const customerWalletSum = await this.WalletReqModel.createQueryBuilder('wallet')
                .select('SUM(wallet.amount)', 'totalAmount')
                .where({
                    user_type: 'Customer',
                    status: OptionsMessage.WALLET_STATUS.Approved,
                    ...dateFilter,
                })
                .getRawOne();

            const providerWalletSum = await this.WalletReqModel.createQueryBuilder('wallet')
                .select('SUM(wallet.amount)', 'totalAmount')
                .where({
                    user_type: 'Provider',
                    status: OptionsMessage.WALLET_STATUS.Approved,
                    ...dateFilter,
                })
                .getRawOne();

            // Response structure
            const response = {
                total_provider: total_provider,
                total_customer: total_customer,
                total_product: total_product,
                total_category: total_category,
                report_of_misuse: missuseReport,
                customer_wallet_amount: customerWalletSum?.totalAmount || 0,
                provider_wallet_amount: providerWalletSum?.totalAmount || 0,
            };

            return { status: true, message: CommonMessages.GET_LIST('Dashboard'), data: response };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

}
