// src/template/template.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CommonMessages } from 'src/common/common-messages';
import { AdminGuard } from 'src/authGuard/admin.guard';
import * as xlsx from 'xlsx';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/schema/user.schema';
import { Like, Repository } from 'typeorm';
import { OptionsMessage } from 'src/common/options';
import { Rating } from 'src/schema/rating.schema';

@Controller('/customer')
@UseGuards(AdminGuard)
export class CustomerController {
    constructor(
        private readonly userService: CustomerService,
        @InjectRepository(User)
        private readonly UserModel: Repository<User>,
        
        @InjectRepository(Rating)
        private readonly RatingModel: Repository<Rating>,
    ) { }

    @Get('list')
    async getList(@Req() req: any) {
        try {
            const { page, size, s, is_active } = req.query;
            const data = await this.userService.getAllPages(page, size, s, is_active);
            return { status: true, message: CommonMessages.GET_LIST('Customer'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Get('alllist')
    async getallList(@Req() req: any) {
        try {
            const data = await this.UserModel.find({ where: { user_role: OptionsMessage.USER_ROLE.CUSTOMER } });
            return { status: true, message: CommonMessages.GET_LIST('Customer'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Get('get/:id')
    async getbyId(@Param('id') id: number) {
        try {
            const data = await this.userService.getData(id);
            return { status: true, message: CommonMessages.GET_DATA('Customer'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Post('create')
    async createdata(@Body() createDto: any) {
        try {
            const data = await this.userService.createData(createDto);
            return { status: true, message: CommonMessages.created_data('Customer'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Put('update/:id')
    async updatedata(@Param('id') id: number, @Body() updateData: any) {
        try {
            const data = await this.userService.updateData(id, updateData);
            return { status: true, message: CommonMessages.updated_data('Customer'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Delete('delete/:id')
    async deletedata(@Param('id') id: number) {
        try {
            await this.userService.deleteData(id);
            return { status: true, message: CommonMessages.deleted_data('Customer') };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Delete('bulkdelete')
    async bulkDeletedata(@Body('ids') ids: number[]) {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                return { status: false, message: `Please select customer for delete`, };
            }

            const deletedCount = await this.userService.bulkDeletedata(ids);

            return { status: true, message: `${deletedCount} customer deleted successfully`, };
        } catch (error) {
            return { status: false, message: error.message, };
        }
    }

    // @Patch('export')
    // async exportListToXLSX(@Req() req, @Res() res) {
    //     try {
    //         const { s = '', is_active = 'all' } = req.query;

    //         let whereConditions: any = { user_role: OptionsMessage.USER_ROLE.CUSTOMER };
    //         if (s) { whereConditions.name = Like(`%${s}%`); }
    //         if (is_active !== undefined && is_active !== 'all' && is_active !== 'All') {
    //             whereConditions.is_active = is_active === '1' ? true : is_active === '0' ? false : whereConditions.is_active;
    //         }

    //         const data = await this.UserModel.find({ where: whereConditions, order: { createdAt: 'DESC' } });

    //         // Format the data for Excel export
    //         const exportedData = data.map((item: any) => ({
    //             "Name": item?.name || '',
    //             // "Email": item?.email || '',
    //             "Phone": item?.phone_num || '',
    //             "Address 1": item?.address_one || '',
    //             "Address 2": item?.address_two || '',
    //             "Available balance": item?.wallet_balance || '',
    //             // "Role": 'Customer',
    //             "Is Active": item?.is_active ? 'Active' : 'Inactive',
    //             // "Created At": new Date(item?.createdAt).toLocaleString(),
    //             "Created At": new Date(item?.createdAt).toLocaleString(),

    //             // "Updated At": new Date(item?.updatedAt).toLocaleString(),
    //         }));

    //         const ws = xlsx.utils.json_to_sheet(exportedData);
    //         const wb = xlsx.utils.book_new();
    //         xlsx.utils.book_append_sheet(wb, ws, 'User List');

    //         const buffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });

    //         res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',);
    //         res.setHeader('Content-Disposition', 'attachment; filename=user_list_export.xlsx',);
    //         res.setHeader('Content-Length', buffer.length.toString());

    //         return res.send(buffer);
    //     } catch (error) {
    //         return res.status(500).json({ status: false, message: error.message });
    //     }
    // }

    @Patch('export')
    async exportListToXLSX(@Req() req, @Res() res) {
        try {
            const { s = '', is_active = 'all' } = req.query;
    
            let whereConditions: any = { user_role: OptionsMessage.USER_ROLE.CUSTOMER };
            if (s) { whereConditions.name = Like(`%${s}%`); }
            if (is_active !== undefined && is_active !== 'all' && is_active !== 'All') {
                whereConditions.is_active = is_active === '1' ? true : is_active === '0' ? false : whereConditions.is_active;
            }
    
            const data = await this.UserModel.find({ where: whereConditions, order: { createdAt: 'DESC' } });
    
            // Fetch customer IDs
            const customerIds = data.map((customer) => customer.id);
    
            // Fetch ratings for the customers
            const ratings = await this.RatingModel.createQueryBuilder('ratings')
                .select('ratings.customer_id', 'customerId')
                .addSelect('AVG(ratings.rating)', 'averageRating')
                .addSelect('COUNT(ratings.rating)', 'ratingCount')
                .where('ratings.customer_id IN (:...customerIds)', { customerIds })
                .groupBy('ratings.customer_id')
                .getRawMany();
    
            // Function to round to the nearest 0.5
            const roundToHalf = (value: number) => Math.round(value * 2) / 2;
    
            // Map ratings to their respective customers
            const ratingsMap = ratings.reduce((acc, rating) => {
                acc[rating.customerId] = {
                    averageRating: roundToHalf(parseFloat(rating.averageRating)),
                    ratingCount: parseInt(rating.ratingCount, 10),
                };
                return acc;
            }, {});
    
            // Format the data for Excel export
            const exportedData = data.map((item: any) => ({
                "Name": item?.name || '',
                "Phone": item?.phone_num || '',
                "Address 1": item?.address_one || '',
                "Address 2": item?.address_two || '',
                "Available Balance": item?.wallet_balance || '',
                "Rating": ratingsMap[item.id]?.averageRating || 0, // Add average rating
                "Rating Count": ratingsMap[item.id]?.ratingCount || 0, // Add rating count
                "Is Active": item?.is_active ? 'Active' : 'Inactive',
                "Created At": new Date(item?.createdAt).toLocaleString(),
            }));
    
            const ws = xlsx.utils.json_to_sheet(exportedData);
            const wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, ws, 'User List');
    
            const buffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });
    
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=user_list_export.xlsx');
            res.setHeader('Content-Length', buffer.length.toString());
    
            return res.send(buffer);
        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    }
    
}
