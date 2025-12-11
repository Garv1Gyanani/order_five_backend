// src/template/template.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CategoryRequestService } from './category_request.service';
import { CommonMessages } from 'src/common/common-messages';
import { AdminGuard } from 'src/authGuard/admin.guard';
import { OptionsMessage } from 'src/common/options';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryRequest } from 'src/schema/category_request.schema';
import { Brackets, Like, Repository } from 'typeorm';
import { Category } from 'src/schema/category.schema';
import * as xlsx from 'xlsx';
import { Notification } from 'src/schema/notification.schema';
import { User } from 'src/schema/user.schema';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
dotenv.config();
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CREDENTIALS || '{}')),
    });
}
@Controller('/categoryrequest')
@UseGuards(AdminGuard)
export class CategoryRequestController {
    constructor(
        private readonly CategoryRequestService: CategoryRequestService,
        @InjectRepository(Category)
        private readonly CategoryModel: Repository<Category>,
        @InjectRepository(CategoryRequest)
        private readonly CategoryRequestModel: Repository<CategoryRequest>,
        @InjectRepository(Notification)
        private readonly NotificationModel: Repository<Notification>,
        @InjectRepository(User)
        private readonly User: Repository<User>,
    ) { }

    @Get('list')
    async getList(@Req() req: any) {
        try {
            const { page, size, s, status } = req.query;
            const data = await this.CategoryRequestService.getAllPages(page, size, s, status);
            return { status: true, message: CommonMessages.GET_LIST('Category Request'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Get('userlist/:id')
    async getuserList(@Req() req: any, @Param('id') id: number) {
        try {
            const { page, size, s, status } = req.query;
            const data = await this.CategoryRequestService.getUserAllPages(id, page, size, s, status);
            return { status: true, message: CommonMessages.GET_LIST('Category Request'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }


    @Get('get/:id')
    async getbyId(@Param('id') id: number) {
        try {
            const data = await this.CategoryRequestService.getData(id);
            return { status: true, message: CommonMessages.GET_DATA('Category Request'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Post('create')
    async createdata(@Body() createDto: any, @Req() req) {
        try {
            // let { local } = req.query
            // if (local == OptionsMessage.LOCAL_TYPE.ARABIC) {
            //     createDto.ar_category_name = createDto.category_name
            //     delete createDto.category_name
            // }
            const data = await this.CategoryRequestService.createData(createDto);
            return { status: true, message: CommonMessages.created_data('Category Request'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    // @Put('update/:id')
    // async updatedata(@Param('id') id: number, @Body() updateData: any, @Req() req) {
    //     try {
    //         // let { local } = req.query
    //         // if (local == OptionsMessage.LOCAL_TYPE.ARABIC) {
    //         //     updateData.ar_category_name = updateData.category_name
    //         //     delete updateData.category_name
    //         // }
    //         const data = await this.CategoryRequestService.updateData(id, updateData);
    //         const responsedata = await this.CategoryRequestService.getDatabyid(id);
    //         if (!responsedata) {
    //             return { status: false, message: CommonMessages.notFound('Category request') };
    //         }
    //         if (updateData.status == OptionsMessage.CATEGORY_STATUS.Approved) {
    //             let data: any = {
    //                 provider_type: responsedata.provider_type,
    //                 category_name: responsedata.category_name,
    //                 category_img: responsedata.category_img,
    //                 ar_category_name: responsedata.ar_category_name,
    //                 parent_category_id: responsedata.parent_category_id,
    //                 is_active: true,
    //                 category_req_id: id
    //             }
    //             // if (local == OptionsMessage.LOCAL_TYPE.ARABIC) {
    //             //     data.ar_category_name = data.category_name
    //             //     delete data.category_name
    //             // }
    //             let newCategory: any = await this.CategoryModel.create(data);
    //             newCategory = await this.CategoryModel.save(newCategory)
    //         }
    //         return { status: true, message: CommonMessages.updated_data('Category Request'), data };
    //     } catch (error) {
    //         return { status: false, message: error.message };
    //     }
    // }

    @Put('update/:id')
async updatedata(@Param('id') id: number, @Body() updateData: any, @Req() req) {
    try {
        // Update category request data
        const data = await this.CategoryRequestService.updateData(id, updateData);
        const responsedata = await this.CategoryRequestService.getDatabyid(id);
        if (!responsedata) {
            return { status: false, message: CommonMessages.notFound('Category request') };
        }

        // If the status is approved, create a new category
        if (updateData.status == OptionsMessage.CATEGORY_STATUS.Approved) {
            let newCategoryData: any = {
                provider_type: responsedata.provider_type,
                category_name: responsedata.category_name,
                category_img: responsedata.category_img,
                ar_category_name: responsedata.ar_category_name,
                parent_category_id: responsedata.parent_category_id,
                is_active: true,
                category_req_id: id,
            };

            // Create and save the new category
            let newCategory: any = await this.CategoryModel.create(newCategoryData);
            newCategory = await this.CategoryModel.save(newCategory);

            // Send a notification for the approval
            const notificationTitle = 'Category Approved';
            const notificationDescription = `Your category request "${responsedata.category_name}" has been approved.`;

            // Save the notification in the database
            const notificationData = await this.NotificationModel.save({
                title: notificationTitle,
                description: notificationDescription,
                user_id: responsedata.user_id, // Assuming the category request includes the user_id
                click_event: 'category',
                createdAt: new Date(),
            });

            const user = await this.User.findOne({ where: { id: responsedata.user_id } });
            if (user?.device_token) {
                const notificationPayload = {
                    notification: {
                        title: notificationTitle,
                        body: notificationDescription,
                    },
                    data: {
                        title: notificationData.title,
                        description: notificationData.description,
                        user_id: notificationData.user_id.toString(),
                        click_event: notificationData.click_event,
                        createdAt: notificationData.createdAt.toISOString(),
                    },
                    token: user.device_token,
                };

                try {
                    const response = await admin.messaging().send(notificationPayload);
                    console.log(`Notification sent successfully: ${response}`);
                } catch (error) {
                    console.error('Error sending notification:', error.message || error);
                }
            } else {
                console.log('No device token found for the user.');
            }
        }

        return { status: true, message: CommonMessages.updated_data('Category Request'), data };
    } catch (error) {
        return { status: false, message: error.message };
    }
}


    @Delete('delete/:id')
    async deletedata(@Param('id') id: number) {
        try {
            await this.CategoryRequestService.deleteData(id);
            return { status: true, message: CommonMessages.deleted_data('Category Request') };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Delete('bulkdelete')
    async bulkDeletedata(@Body('ids') ids: number[]) {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                return { status: false, message: `Please select categories for delete`, };
            }

            const deletedCount = await this.CategoryRequestService.bulkDeletedata(ids);

            return { status: true, message: `${deletedCount} categories deleted successfully`, };
        } catch (error) {
            return { status: false, message: error.message, };
        }
    }


    @Patch('export')
    async exportListToXLSX(@Req() req, @Res() res) {
        try {
            const { search, status } = req.query;
    
            const queryBuilder = this.CategoryRequestModel.createQueryBuilder('category');
    
            // Join user and parent_category relations
            queryBuilder
                .leftJoinAndSelect('category.user', 'user')
                .leftJoinAndSelect('category.parent_category', 'parent_category');
    
            // Add status filter if provided
            if (status) {
                queryBuilder.andWhere('category.status = :status', { status });
            }
    
            // Add search filter if provided
            if (search) {
                queryBuilder.andWhere(
                    new Brackets((qb) => {
                        qb.where('user.name LIKE :search', { search: `%${search}%` })
                            .orWhere('category.category_name LIKE :search', { search: `%${search}%` })
                            .orWhere('category.ar_category_name LIKE :search', { search: `%${search}%` });
                    })
                );
            }
    
            // Add sorting
            queryBuilder.orderBy('category.createdAt', 'DESC');
    
            // Fetch data
            const data = await queryBuilder.getMany();
    
            // Map the data to include the required fields
            const exportedData = data.map((item: any) => ({
                "ID": item.id || '',
                "User Name": item.user?.name || '', // User name from the joined relation
                "Category Name": item.category_name || '',
                "Arabic Category Name": item.ar_category_name || '',
                "Provider Type": item.provider_type || '',
                "Category Image": item.category_img || '',
                "Parent Category Name": item.parent_category?.category_name || '', // Parent category name
                "Parent Arabic Category Name": item.parent_category?.ar_category_name || '', // Parent Arabic category name
                "Status": item.status || '', // Include status
                "Created At": new Date(item.createdAt).toLocaleString(), // Format created date
            }));
    
            // Create Excel sheet
            const ws = xlsx.utils.json_to_sheet(exportedData);
            const wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, ws, 'Category List');
    
            const buffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });
    
            // Set response headers
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=category_list_export.xlsx');
            res.setHeader('Content-Length', buffer.length.toString());
    
            return res.send(buffer);
        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    }


}
