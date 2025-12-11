// src/template/template.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProductRequestService } from './product_request.service';
import { CommonMessages } from 'src/common/common-messages';
import { AdminGuard } from 'src/authGuard/admin.guard';
import { OptionsMessage } from 'src/common/options';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Product } from 'src/schema/product.schema';
import * as xlsx from 'xlsx';
import { ProductRequest } from 'src/schema/product_request.schema';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { Notification } from 'src/schema/notification.schema';
import { User } from 'src/schema/user.schema';
dotenv.config();
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CREDENTIALS || '{}')),
    });
}
@Controller('/productrequest')
@UseGuards(AdminGuard)
export class ProductRequestController {
    constructor(
        private readonly ProductRequestService: ProductRequestService,
        @InjectRepository(Product)
        private readonly ProductModel: Repository<Product>,
        @InjectRepository(ProductRequest)
        private readonly ProductRequestModel: Repository<ProductRequest>,
        @InjectRepository(Notification)
        private readonly NotificationModel: Repository<Notification>,
        @InjectRepository(User)
        private readonly UserModel: Repository<User>,
    ) { }

    @Get('list')
    async getList(@Req() req: any) {
        try {
            const { page, size, s, status, category_id } = req.query;
            const data = await this.ProductRequestService.getAllPages(page, size, s, status, category_id);
            return { status: true, message: CommonMessages.GET_LIST('Product Request'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Get('userlist/:id')
    async getUserList(@Req() req: any, @Param('id') id: number) {
        try {
            const { page, size, s, status } = req.query;
            const data = await this.ProductRequestService.getUserAllPages(id, page, size, s, status);
            return { status: true, message: CommonMessages.GET_LIST('Product Request'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Get('get/:id')
    async getbyId(@Param('id') id: number) {
        try {
            const data = await this.ProductRequestService.getData(id);
            return { status: true, message: CommonMessages.GET_DATA('Product Request'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Post('create')
    async createdata(@Body() createDto: any, @Req() req) {
        try {
            // let { local } = req.query
            // if (local == OptionsMessage.LOCAL_TYPE.ARABIC) {
            //     createDto.ar_product_name = createDto.product_name
            //     createDto.ar_description_name = createDto.description_name
            //     delete createDto.product_name
            //     delete createDto.description_name
            // }
            let dataobj: any = {
                description_name: createDto.description_name,
                ar_description_name: createDto.ar_description_name,
                product_unit: createDto.product_unit,
                provider_type: createDto.provider_type,
                product_name: createDto.product_name,
                additional_info: createDto.additional_info,
                product_img: createDto.product_img,
                ar_product_name: createDto.ar_product_name,
                category_id: createDto.category_id,
                product_price: createDto.product_price,
                delievery_charge: createDto.delievery_charge,
                delievery_address: createDto.delievery_address,
                is_active: true,
            }
            // if (local == OptionsMessage.LOCAL_TYPE.ARABIC) {
            //     dataobj.ar_product_name = dataobj.product_name
            //     dataobj.ar_description_name = dataobj.description_name
            //     delete dataobj.product_name
            //     delete dataobj.description_name
            // }
            let newCategory: any = await this.ProductModel.create(dataobj);
            newCategory = await this.ProductModel.save(newCategory)

            let productreqedata = {
                user_id: createDto.user_id,
                product_id: newCategory.id,
                product_price: createDto.product_price,
                delievery_charge: createDto.delievery_charge,
                status: OptionsMessage.PRODUCT_STATUS.Approved
            }
            const data = await this.ProductRequestService.createData(productreqedata);

            return { status: true, message: CommonMessages.created_data('Product Request'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    //     @Put('update/:id')
    //     async updatedata(@Param('id') id: number, @Body() updateData: any, @Req() req) {
    //         try {
    //             // let { local } = req.query
    //             // if (local == OptionsMessage.LOCAL_TYPE.ARABIC) {
    //             //     updateData.ar_product_name = updateData.product_name
    //             //     updateData.ar_description_name = updateData.description_name
    //             //     delete updateData.product_name
    //             //     delete updateData.description_name
    //             // }
    //             let product_obj = (updateData.status == OptionsMessage.PRODUCT_STATUS.Approved) ?
    //                 { status: OptionsMessage.PRODUCT_STATUS.Approved } : (updateData.status == OptionsMessage.PRODUCT_STATUS.Rejected) ? { status: OptionsMessage.PRODUCT_STATUS.Rejected } : {
    //                     product_price: updateData.product_price,
    //                     delievery_charge: updateData.delievery_charge,
    //                     status: OptionsMessage.PRODUCT_STATUS.Requested,
    //                 }
    //             const data = await this.ProductRequestService.updateData(id, product_obj);
    //             const response_data = await this.ProductRequestService.getDatabyid(id);
    //             if (!response_data) {
    //                 return { status: false, message: CommonMessages.notFound('Product Request') };
    //             }
    //             const product_data = await this.ProductModel.findOne({ where: { id: response_data?.product_id } });
    //             if (!product_data) {
    //                 return { status: false, message: CommonMessages.notFound('Product') };
    //             }
    //             if (response_data && updateData.status == OptionsMessage.PRODUCT_STATUS.Approved) {
    //                 let obj: any = { is_active: true }
    //                 await this.ProductModel.update(response_data.product_id, obj);
    //             }
    //             delete updateData.status
    //             delete updateData.delievery_charge
    //             delete updateData.product_price
    //             let Productdata = await this.ProductModel.update(response_data?.product_id, updateData);

    //             const prod = await this.ProductRequestModel.findOne({ where: { id } })
    //             const RealUser = await this.UserModel.findOne({ where: { id: prod.user_id } })



    // console.log(RealUser.device_token)
    //             if (updateData.status == OptionsMessage.PRODUCT_STATUS.Approved) {
    // console.log('RealUser.device_token')

    //                 // Product Approved
    //                 const notificationTitle = "Product Request Approved";
    //                 const notificationDescription = `Your product request for "${product_data.product_name}" has been approved.`;

    //                 // Save notification in NotificationModel
    //               const dataPayload=  await this.NotificationModel.save({
    //                     title: notificationTitle,
    //                     description: notificationDescription,
    //                     user_id: RealUser.id,
    //                     click_event: 'product_request',
    //                     createdAt: new Date(),
    //                 });

    //                 const deviceToken = RealUser.device_token;
    //                  if (deviceToken) { 

    //                     const notificationPayload = {
    //                         notification: {
    //                             title: notificationTitle,
    //                             body: notificationDescription,
    //                         },
    //                         data: {
    //                             title: dataPayload.title,
    //                             description: dataPayload.description,
    //                             user_id: dataPayload.user_id.toString(), 
    //                             click_event: dataPayload.click_event,
    //                             createdAt: dataPayload.createdAt.toISOString(),
    //                         },
    //                         token: deviceToken,
    //                     };

    //                     try {
    //                         const response = await admin.messaging().send(notificationPayload);
    //                         console.log(`Notification sent successfully: ${response}`);
    //                     } catch (error) {
    //                         console.log('Error sending notification:', error.message || error);
    //                     }
    //                 } else {
    //                     console.log('No device token found for the user.');
    //                 }

    //                 // Activate product
    //                 await this.ProductModel.update(response_data.product_id, { is_active: true });
    //             } else if (updateData.status == OptionsMessage.PRODUCT_STATUS.Rejected) {
    //                 // Product Rejected
    //                 const notificationTitle = "Product Request Rejected";
    //                 const notificationDescription = `Your product request for "${product_data.product_name}" has been rejected.`;

    //                 // Save notification in NotificationModel 
    //                 const dataPayload =await this.NotificationModel.save({
    //                     title: notificationTitle,
    //                     description: notificationDescription,
    //                     user_id: RealUser.id,
    //                     click_event: 'product_request',
    //                     createdAt: new Date(),
    //                 });


    //                 // Send push notification to user's device
    //                 const deviceToken = RealUser.device_token;
    //                 console.log(deviceToken,"deviceToken")

    //                 if (deviceToken) {
    //                     const notificationPayload = {
    //                         notification: {
    //                             title: notificationTitle,
    //                             body: notificationDescription,
    //                         },
    //                         data: {
    //                             title: dataPayload.title,
    //                             description: dataPayload.description,
    //                             user_id: dataPayload.user_id.toString(), // Convert to string
    //                             click_event: dataPayload.click_event,
    //                             createdAt: dataPayload.createdAt.toISOString(),
    //                         },
    //                         token: deviceToken,
    //                     };

    //                     try {
    //                         const response = await admin.messaging().send(notificationPayload);
    //                         console.log(`Notification sent successfully: ${response}`);
    //                     } catch (error) {
    //                         console.error('Error sending notification:', error.message || error);
    //                     }
    //                 } else {
    //                     console.log('No device token found for the user.');
    //                 }
    //             }


    //             return { status: true, message: CommonMessages.updated_data('Product Request'), data };
    //         } catch (error) {
    //             return { status: false, message: error.message };
    //         }
    //     }

    @Put('update/:id')
    async updatedata(@Param('id') id: number, @Body() updateData: any, @Req() req) {
        try {
            let product_obj = (updateData.status == OptionsMessage.PRODUCT_STATUS.Approved) ?
                { status: OptionsMessage.PRODUCT_STATUS.Approved } : (updateData.status == OptionsMessage.PRODUCT_STATUS.Rejected) ? { status: OptionsMessage.PRODUCT_STATUS.Rejected } : {
                    product_price: updateData.product_price,
                    delievery_charge: updateData.delievery_charge,
                    status: OptionsMessage.PRODUCT_STATUS.Requested,
                };

            const data = await this.ProductRequestService.updateData(id, product_obj);

            const response_data = await this.ProductRequestService.getDatabyid(id);
            if (!response_data) {
                return { status: false, message: CommonMessages.notFound('Product Request') };
            }

            const product_data = await this.ProductModel.findOne({ where: { id: response_data?.product_id } });
            if (!product_data) {
                return { status: false, message: CommonMessages.notFound('Product') };
            }

            if (response_data && updateData.status == OptionsMessage.PRODUCT_STATUS.Approved) {
                let obj: any = { is_active: true };
                await this.ProductModel.update(response_data.product_id, obj);
            }

            const prod = await this.ProductRequestModel.findOne({ where: { id } });
            const RealUser = await this.UserModel.findOne({ where: { id: prod.user_id } });

            console.log(RealUser.device_token);  

            if (updateData.status == OptionsMessage.PRODUCT_STATUS.Approved) {
                console.log('RealUser.device_token');

                const notificationTitle = "Product Request Approved";
                const notificationDescription = `Your product request for "${product_data.product_name}" has been approved.`;

                const dataPayload = await this.NotificationModel.save({
                    title: notificationTitle,
                    description: notificationDescription,
                    user_id: RealUser.id,
                    click_event: 'product_request',
                    createdAt: new Date(),
                });

                const deviceToken = RealUser.device_token;
                if (deviceToken) {
                    const notificationPayload = {
                        notification: {
                            title: notificationTitle,
                            body: notificationDescription,
                        },
                        data: {
                            title: dataPayload.title,
                            description: dataPayload.description,
                            user_id: dataPayload.user_id.toString(),
                            click_event: dataPayload.click_event,
                            createdAt: dataPayload.createdAt.toISOString(),
                        },
                        token: deviceToken,
                    };

                    try {
                        const response = await admin.messaging().send(notificationPayload);
                        console.log(`Notification sent successfully: ${response}`);
                    } catch (error) {
                        console.log('Error sending notification:', error.message || error);
                    }
                } else {
                    console.log('No device token found for the user.');
                }

                await this.ProductModel.update(response_data.product_id, { is_active: true });
            } else if (updateData.status == OptionsMessage.PRODUCT_STATUS.Rejected) {
                const notificationTitle = "Product Request Rejected";
                const notificationDescription = `Your product request for "${product_data.product_name}" has been rejected.`;

                const dataPayload = await this.NotificationModel.save({
                    title: notificationTitle,
                    description: notificationDescription,
                    user_id: RealUser.id,
                    click_event: 'product_request',
                    createdAt: new Date(),
                });

                const deviceToken = RealUser.device_token;
                console.log(deviceToken, "deviceToken");

                if (deviceToken) {
                    const notificationPayload = {
                        notification: {
                            title: notificationTitle,
                            body: notificationDescription,
                        },
                        data: {
                            title: dataPayload.title,
                            description: dataPayload.description,
                            user_id: dataPayload.user_id.toString(),
                            click_event: dataPayload.click_event,
                            createdAt: dataPayload.createdAt.toISOString(),
                        },
                        token: deviceToken,
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

            delete updateData.status;
            delete updateData.delievery_charge;
            delete updateData.product_price;

            let Productdata = await this.ProductModel.update(response_data?.product_id, updateData);

            return { status: true, message: CommonMessages.updated_data('Product Request'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Put('active/:id')
    async updateActive(@Param('id') id: number, @Body() updateData: any, @Req() req) {
        try {
            const data = await this.ProductRequestService.updateData(id, updateData);
            return { status: true, message: CommonMessages.updated_data('Product Request'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Delete('delete/:id')
    async deletedata(@Param('id') id: number) {
        try {
            await this.ProductRequestService.deleteData(id);
            return { status: true, message: CommonMessages.deleted_data('Product Request') };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Delete('bulkdelete')
    async bulkDeletedata(@Body('ids') ids: number[]) {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                return { status: false, message: `Please select Product for delete`, };
            }

            const deletedCount = await this.ProductRequestService.bulkDeletedata(ids);

            return { status: true, message: `${deletedCount} Product deleted successfully`, };
        } catch (error) {
            return { status: false, message: error.message, };
        }
    }

    @Patch('export')
    async exportAllPagesToXLSX(@Req() req, @Res() res) {
        try {
            const { search = '', status, category_id } = req.query;
    
            const queryBuilder = this.ProductRequestModel.createQueryBuilder('productRequest')
                .leftJoinAndSelect('productRequest.user', 'user')
                .leftJoinAndSelect('productRequest.product', 'product')
                .leftJoinAndSelect('product.category', 'category')
                .select([
                    'productRequest',
                    'user.name',
                    'user.address_one',
                    'user.address_two',
                    'product.provider_type',
                    'product.product_img',
                    'product.product_name',
                    'product.description_name',
                    'product.ar_product_name',
                    'product.ar_description_name',
                    'product.delievery_charge',
                    'product.product_price',
                    'product.product_unit',
                    'product.createdAt',
                    'product.category_id',
                    'category.category_name',
                    'category.ar_category_name',
                ])
                .orderBy('productRequest.createdAt', 'DESC');
    
            // Add conditions dynamically
            if (status) {
                queryBuilder.andWhere('productRequest.status = :status', { status });
            }
    
            if (category_id) {
                queryBuilder.andWhere('product.category_id = :category_id', { category_id });
            }
    
            if (search) {
                queryBuilder.andWhere(
                    '(product.product_name LIKE :search COLLATE utf8mb4_general_ci OR product.ar_product_name LIKE :search COLLATE utf8mb4_general_ci)',
                    { search: `%${search}%` }
                );
            }
    
            // Execute the query and fetch all data
            const pages = await queryBuilder.getMany();
    
            // Format data for export
            const exportedData = pages.map((productRequest) => ({
                "Request ID": productRequest.id || '',
                "User Name": productRequest.user?.name || '',
                "User Address One": productRequest.user?.address_one || '',
                "User Address Two": productRequest.user?.address_two || '',
                "Provider Type": productRequest.product?.provider_type || '',
                "Product Name": productRequest.product?.product_name || '',
                "Arabic Product Name": productRequest.product?.ar_product_name || '',
                "Description": productRequest.product?.description_name || '',
                "Arabic Description": productRequest.product?.ar_description_name || '',
                "Delivery Charge": productRequest.product?.delievery_charge || '',
                "Price": productRequest.product?.product_price || '',
                "Unit": productRequest.product?.product_unit || '',
                "Category": productRequest.product?.category?.category_name || '',
                "Arabic Category": productRequest.product?.category?.ar_category_name || '',
                "Created At": new Date(productRequest.product?.createdAt).toLocaleString(),
                "Status": productRequest.status || '',
            }));
    
            // Create Excel sheet
            const ws = xlsx.utils.json_to_sheet(exportedData);
            const wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, ws, 'Product Requests');
    
            const buffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });
    
            // Set response headers
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=product_requests_export.xlsx');
            res.setHeader('Content-Length', buffer.length.toString());
    
            return res.send(buffer);
        } catch (error) {
            console.error('Error exporting product requests:', error);
            return res.status(500).json({ status: false, message: error.message });
        }
    }
    

}
