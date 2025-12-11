// src/template/template.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { CommonMessages } from 'src/common/common-messages';
import { AdminGuard } from 'src/authGuard/admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { InjectRepository } from '@nestjs/typeorm';
import { User_document } from 'src/schema/user_document.schema';
import { Like, In, Repository, Not } from 'typeorm';
import * as xlsx from 'xlsx';
import { OptionsMessage } from 'src/common/options';
import { User } from 'src/schema/user.schema';
import CommonService from 'src/common/common.util';
import { Setting } from 'src/schema/setting.schema';
import { EmailTemplate } from 'src/schema/email_templates.schema';
import { Required_doc } from 'src/schema/required_doc.schema';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { Notification } from 'src/schema/notification.schema';
import { Rating } from 'src/schema/rating.schema';

import { Order } from 'src/schema/order.schema';
 import { Wallet_req } from 'src/schema/wallet_req.schema';
import { Subscription } from 'src/schema/subscription.schema';
 dotenv.config();
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CREDENTIALS || '{}')),
    });
}
@Controller()
@UseGuards(AdminGuard)
export class ProviderController {
    constructor(
        private readonly ProviderService: ProviderService,
        @InjectRepository(User)
        private readonly UserModel: Repository<User>,
        @InjectRepository(Required_doc)
        private readonly Required_docModel: Repository<Required_doc>,
        @InjectRepository(EmailTemplate)
        private readonly EmailTemplateModel: Repository<EmailTemplate>,
        @InjectRepository(User_document)
        private readonly UserDocumentModel: Repository<User_document>,
 
        
        @InjectRepository(Notification)
        private readonly NotificationModel: Repository<Notification>, 
        @InjectRepository(Order)
        private readonly Order: Repository<Order>,
        @InjectRepository(Rating)
        private readonly RatingModel: Repository<Rating>,
        @InjectRepository(Wallet_req)
        private readonly wallet_req: Repository<Wallet_req>,
        @InjectRepository(Subscription)
        private readonly SubscriptionModel: Repository<Subscription>,
    ) { }

    // provider ==============================
    @Get('/provider/list')
    async getUserList(@Req() req: any) {
        try {
            const { page, size, s } = req.query;
            const data = await this.ProviderService.getAllPages(page, size, s);
            return { status: true, message: CommonMessages.GET_LIST('Provider'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Get('/provider/alllist')
    async getAllprovider(@Req() req: any) {
        try {
            const userRoles = [OptionsMessage.USER_ROLE.PROVIDER];
            const providers = await this.UserModel.find({ where: { user_role: In(userRoles) }, select: ['id', 'name', 'phone_num'], });

            const formattedData = providers.map(provider => ({
                id: provider.id,
                name: `${provider.name} ( ${provider.phone_num} )`
            }));

            return { status: true, message: CommonMessages.GET_LIST('Provider'), data: formattedData };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }


    @Get('/user/alllist')
    async getAllUsers(@Req() req: any) {
        try {
            const userRoles = [OptionsMessage.USER_ROLE.CUSTOMER, OptionsMessage.USER_ROLE.PROVIDER];

            const data = await this.UserModel.find({ where: { user_role: In(userRoles) }, select: ['id', 'name', 'phone_num'], });

            const formattedData = data.map(items => ({
                id: items.id,
                name: `${items.name} ( ${items.phone_num} )`
            }));
            return { status: true, message: CommonMessages.GET_LIST('Users'), data: formattedData };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Get('/provider/get/:id')
    async getUserbyId(@Param('id') id: number) {
        try {
            let data: any = await this.ProviderService.getUserData(id);

            let requiredDocs = await this.Required_docModel.find({ where: { is_active: true }, select: ['id'], });
            let requiredDocIds = requiredDocs.map(doc => doc.id);
            let userApprovedDocs = await this.UserDocumentModel.count({ where: { user_id: id, required_doc_id: In(requiredDocIds) } });

            let orderCount = await this.Order.count({
                where: {
                    provider_id: id,
                    status: Not(In(['CANCELBYCUSTOMER', 'CANCELBYPROVIDER', 'CANCELBYADMIN']))
                }
            });

            let ReviewRating = await this.RatingModel.count({
                where: {
                    provider_id: id,
                 }
            });
            
    
            let walletRequests = await this.wallet_req.find({
                where: {
                    user_id: id,
                    amount_status: 'Debit',
                    status: 'Approved'
                },
                select: ['amount']
            });

            const ratings = await this.RatingModel.find({
                where: { provider_id: id },
                select: ['rating']
            });

            const totalRatings = ratings.length;
            const totalRatingSum = ratings.reduce((sum, item) => sum + Number(item.rating), 0);
            const averageRating = totalRatings > 0 ? totalRatingSum / totalRatings : 0;

            const roundedRating = Math.round(averageRating * 2) / 2;

    
            let walletAmount = walletRequests.reduce((sum, req) => sum + Number(req.amount), 0);

            let count = requiredDocIds.length + 6
            let totalcount = userApprovedDocs

            if (data?.name) { totalcount += 1 }
            if (data?.phone_num) { totalcount += 1 }
            if (data?.id_number) { totalcount += 1 }
            if (data?.vehical_name) { totalcount += 1 }
            if (data?.vehical_plat_num) { totalcount += 1 }
            if (data?.image_url) { totalcount += 1 }

            let profileCompletePercentage = 0;
            if (count > 0) {
                profileCompletePercentage = (totalcount / count) * 100;
            }
            // profileCompletePercentage = Math.min(profileCompletePercentage, 100);
            data.profile_complete_per = parseFloat(profileCompletePercentage.toFixed(2))
            data.orderCount=orderCount
            data.ReviewRating=ReviewRating
            data.walletAmount=walletAmount
            data.rating =roundedRating

            return { status: true, message: CommonMessages.GET_DATA('Provider'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Post('/provider/create')
    async createUserdata(@Body() createUserDto: any) {
        try {
            createUserDto.status = OptionsMessage.PROVIDER_STATUS.Approved;
            const data = await this.ProviderService.createUserData(createUserDto);

            let user_id = data.id
            if (createUserDto?.user_document && createUserDto.user_document.length) {
                for (const element of createUserDto.user_document) {
                    let existingDoc = await this.UserDocumentModel.findOne({ where: { user_id: user_id, required_doc_id: element?.required_doc_id }, });
                    if (existingDoc) {
                        existingDoc.document = element.document || existingDoc.document;
                        existingDoc.status = OptionsMessage.USER_DOCUMENT.Approved
                        await this.UserDocumentModel.save(existingDoc);
                    } else {
                        const newDoc = this.UserDocumentModel.create({
                            user_id: user_id,
                            required_doc_id: element?.required_doc_id,
                            document: element.document,
                            status: OptionsMessage.USER_DOCUMENT.Approved
                        });
                        await this.UserDocumentModel.save(newDoc);
                    }
                }
            } 

            return { status: true, message: CommonMessages.created_data('Provider'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Put('/provider/update/:id')
    async updateUserdata(@Param('id') id: number, @Body() updateData: any) {
        try {
            const user_document = updateData.user_document
            delete updateData.user_document
            const exists_data = await this.ProviderService.getUserData(id);
            if (!exists_data) {
                return { status: false, message: CommonMessages.notFound('Provider') };
            }
            const data = await this.ProviderService.updateUserData(id, updateData);
            // if (exists_data.status != OptionsMessage.PRODUCT_STATUS.Approved && updateData.status == OptionsMessage.PRODUCT_STATUS.Approved) {
            //     // send mail ================================================================
            //     const adminuser = await this.UserModel.findOne({ where: { user_role: OptionsMessage.USER_ROLE.ADMIN } });
            //     if (adminuser) {
            //         let smtpSettings = await this.settingModel.find();
            //         smtpSettings = JSON.parse(JSON.stringify(smtpSettings))
            //         let template = await this.EmailTemplateModel.findOne({ where: { key: OptionsMessage.EMAIL_TEMPLATE.provider_approve } });
            //         template = JSON.parse(JSON.stringify(template))

            //         let email_data: any = { AdminName: adminuser.name, Username: exists_data.name, Phone_num: exists_data.phone_num }
            //         await CommonService.sendEmail(adminuser.email, email_data, template, smtpSettings,);
            //     }
            // }
            // if (exists_data.status != OptionsMessage.PRODUCT_STATUS.Rejected && updateData.status == OptionsMessage.PRODUCT_STATUS.Rejected) {
            //     // send mail ================================================================
            //     const adminuser = await this.UserModel.findOne({ where: { user_role: OptionsMessage.USER_ROLE.ADMIN } });
            //     if (adminuser) {
            //         let smtpSettings = await this.settingModel.find();
            //         smtpSettings = JSON.parse(JSON.stringify(smtpSettings))
            //         let template = await this.EmailTemplateModel.findOne({ where: { key: OptionsMessage.EMAIL_TEMPLATE.provider_reject } });
            //         template = JSON.parse(JSON.stringify(template))

            //         let email_data: any = { AdminName: adminuser.name, Username: exists_data.name, Phone_num: exists_data.phone_num }
            //         await CommonService.sendEmail(adminuser.email, email_data, template, smtpSettings,);
            //     }
            // }

            let user_id = id
            if (user_document && user_document.length) {
                for (const element of user_document) {
                    let existingDoc = await this.UserDocumentModel.findOne({ where: { user_id: user_id, required_doc_id: element?.required_doc_id }, });
                    if (existingDoc) {
                        existingDoc.document = element.document;
                        existingDoc.status = element.document ? OptionsMessage.USER_DOCUMENT.Approved : OptionsMessage.USER_DOCUMENT.Requested
                        await this.UserDocumentModel.save(existingDoc);
                    } else {
                        const newDoc = this.UserDocumentModel.create({
                            user_id: user_id,
                            required_doc_id: element?.required_doc_id,
                            document: element.document,
                            status: OptionsMessage.USER_DOCUMENT.Approved
                        });
                        await this.UserDocumentModel.save(newDoc);
                    }
                }
            }
            return { status: true, message: CommonMessages.updated_data('Provider'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Delete('/provider/delete/:id')
    async deleteUserdata(@Param('id') id: number) {
        try {
            await this.ProviderService.deleteUserData(id);
            return { status: true, message: CommonMessages.deleted_data('Provider') };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Delete('/provider/bulkdelete')
    async bulkDeletedata(@Body('ids') ids: number[]) {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                return { status: false, message: `Please select Provider for delete`, };
            }

            const deletedCount = await this.ProviderService.bulkDeletedata(ids);

            return { status: true, message: `${deletedCount} Provider deleted successfully`, };
        } catch (error) {
            return { status: false, message: error.message, };
        }
    }


    // @Patch('provider/export')
    // async exportListToXLSX(@Req() req, @Res() res) {
    //     try {
    //         const { s = '' } = req.query;

    //         const whereConditions: any = { user_role: OptionsMessage.USER_ROLE.PROVIDER };
    //         if (s) { whereConditions.name = Like(`%${s}%`); }
    //         const data = await this.UserModel.find({ where: whereConditions, order: { createdAt: 'DESC' } });

    //         // Format the data for Excel export
    //         const exportedData = data.map((item: any) => ({
    //             "Name": item?.name || '',
    //             "Phone": item?.phone_num || '',
    //             "status": item?.status || '',
    //             "Address 1": item?.address_one || '',
    //             "Address 2": item?.address_two || '',
    //             "Rating": '',
    //             "Remark": item?.remark || '',
    //             "Available balance": item?.wallet_balance || '',
    //             // "Role": 'Provider',
    //             "Is Active": item?.is_active ? 'Active' : 'Inactive',
    //             // "Created At": new Date(item?.createdAt).toLocaleString(),
    //             "Created At": new Date(item?.createdAt).toLocaleString(),

    //             // "Updated At": new Date(item?.updatedAt).toLocaleString(),
    //         }));

    //         const ws = xlsx.utils.json_to_sheet(exportedData);
    //         const wb = xlsx.utils.book_new();
    //         xlsx.utils.book_append_sheet(wb, ws, 'Provider List');

    //         const buffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });

    //         res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',);
    //         res.setHeader('Content-Disposition', 'attachment; filename=provider_list_export.xlsx',);
    //         res.setHeader('Content-Length', buffer.length.toString());

    //         return res.send(buffer);
    //     } catch (error) {
    //         console.log(error);
    //         return res.status(500).json({ status: false, message: error.message });
    //     }
    // }

    @Patch('provider/export')
    async exportListToXLSX(@Req() req, @Res() res) {
        try {
            const { s = '' } = req.query;
    
            let whereConditions: any = { user_role: OptionsMessage.USER_ROLE.PROVIDER };
            if (s) {
                whereConditions = [
                    { user_role: OptionsMessage.USER_ROLE.PROVIDER, phone_num: Like(`%${s}%`) },
                    { user_role: OptionsMessage.USER_ROLE.PROVIDER, email: Like(`%${s}%`) },
                    { user_role: OptionsMessage.USER_ROLE.PROVIDER, name: Like(`%${s}%`) },
                ];
            }
    
            // Fetch provider data
            const data = await this.UserModel.find({ where: whereConditions, order: { createdAt: 'DESC' } });
    
            // Fetch ratings for providers
            const providerIds = data.map((provider) => provider.id);
    
            const ratings = await this.RatingModel.createQueryBuilder('ratings')
                .select('ratings.provider_id', 'providerId')
                .addSelect('AVG(ratings.rating)', 'averageRating')
                .addSelect('COUNT(ratings.rating)', 'ratingCount')
                .where('ratings.provider_id IN (:...providerIds)', { providerIds })
                .groupBy('ratings.provider_id')
                .getRawMany();
    
            // Fetch subscription details for providers
            const subscriptionIds = data
                .map((provider) => provider.subscription_id)
                .filter((id) => id !== null); // Remove null values
    
            let subscriptionsMap = {};
            if (subscriptionIds.length > 0) {
                const subscriptions = await this.SubscriptionModel.find({
                    where: { id: In(subscriptionIds) },
                    select: ['id', 'name'],
                });
    
                // Map subscription id to its name
                subscriptionsMap = subscriptions.reduce((acc, sub) => {
                    acc[sub.id] = sub.name;
                    return acc;
                }, {});
            }
    
            // Function to round to the nearest 0.5
            const roundToHalf = (value: number) => Math.round(value * 2) / 2;
    
            // Map ratings to their respective providers
            const ratingsMap = ratings.reduce((acc, rating) => {
                acc[rating.providerId] = {
                    averageRating: roundToHalf(parseFloat(rating.averageRating)),
                    ratingCount: parseInt(rating.ratingCount, 10),
                };
                return acc;
            }, {});
    
            // Format the data for Excel export
            const exportedData = data.map((item: any) => ({
                "Name": item?.name || '',
                "Phone": item?.phone_num || '',
                "Status": item?.status || '',
                "Address 1": item?.address_one || '',
                "Address 2": item?.address_two || '',
                "Rating": ratingsMap[item.id]?.averageRating || 0, // Add average rating
                "Remark": item?.remark || '',
                "Available Balance": item?.wallet_balance || '',
                "Is Active": item?.is_active ? 'Active' : 'Inactive',
                "Plan Type": item.subscription_id ? subscriptionsMap[item.subscription_id] || null : null, // Add plan type
                "Created At": new Date(item?.createdAt).toLocaleString(),
            }));
    
            const ws = xlsx.utils.json_to_sheet(exportedData);
            const wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, ws, 'Provider List');
    
            const buffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });
    
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=provider_list_export.xlsx');
            res.setHeader('Content-Length', buffer.length.toString());
    
            return res.send(buffer);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: false, message: error.message });
        }
    }

    // user documents =============================
    @Get('getuserdocument/:id')
    async UserDocument(
        @Body() UserDocument: any,
        @Param('id') id: number
    ) {
        try {
            const data = await this.ProviderService.GetUserDocument(id);
            return { status: true, message: CommonMessages.upload_data('Document'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Post('uploaddocument')
    async uploaddocument(@Body() UserDocument: any) {
        try {
            const data = await this.ProviderService.createUserDocument(UserDocument);
            return { status: true, message: CommonMessages.upload_data('Document'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Put('updateuserdocument/:id')
    async UpdateUserDocument(
        @Body() UserDocument: any,
        @Param('id') id: number
    ) {
        try {
            const data = await this.ProviderService.UpdateUserDocument(id, UserDocument);

            const userDocuments: any = await this.UserDocumentModel.findOne({ where: { id }, });

            if (userDocuments?.user_id && UserDocument.status == OptionsMessage.USER_DOCUMENT.Approved) {
                let user_id = userDocuments?.user_id

                const userDocuments2 = await this.UserDocumentModel.find({ where: { user_id: user_id }, });
                const isAllApproved = userDocuments2.every((doc) => doc.status === OptionsMessage.USER_DOCUMENT.Approved);
                if (isAllApproved) {
                    let response: any = await this.UserModel.update(user_id, { status: OptionsMessage.PROVIDER_STATUS.Approved });
                    // response = await this.UserModel.save(response)


                    const notificationTitle = "Document Approved";
                    const notificationDescription = `Your document request has been approved.`;

                   const dataPayload = await this.NotificationModel.save({
                        title: notificationTitle,
                        description: notificationDescription,
                        user_id: response.id,
                        click_event: 'document',
                        createdAt: new Date(),
                    });

                    const deviceToken = response.device_token;
                    if (deviceToken) {
                        const notificationPayload = {
                            notification: {
                                title: notificationTitle,
                                body: notificationDescription,
                            },
                            data: {
                                title: dataPayload.title,
                                description: dataPayload.description,
                                user_id: dataPayload.user_id.toString(), // Convert to string
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
                    // // send mail ================================================================
                    // const adminuser = await this.UserModel.findOne({ where: { user_role: OptionsMessage.USER_ROLE.ADMIN } });
                    // if (adminuser) {
                    //     let user_response: any = await this.UserModel.findOne({ where: { id: user_id } });
                    //     let smtpSettings = await this.settingModel.find();
                    //     smtpSettings = JSON.parse(JSON.stringify(smtpSettings))
                    //     let template = await this.EmailTemplateModel.findOne({ where: { key: OptionsMessage.EMAIL_TEMPLATE.provider_approve } });
                    //     template = JSON.parse(JSON.stringify(template))

                    //     let email_data: any = { AdminName: adminuser.name, Username: user_response?.name, Phone_num: user_response?.phone_num }
                    //     await CommonService.sendEmail(adminuser.email, email_data, template, smtpSettings,);
                    // }
                }
            }

            if (userDocuments?.user_id && UserDocument.status == OptionsMessage.USER_DOCUMENT.Rejected) {
                let user_id = userDocuments.user_id
                let response: any = await this.UserModel.update(user_id, { status: OptionsMessage.PROVIDER_STATUS.Rejected });
                // response = await this.UserModel.save(response)

                // // send mail ================================================================
                // const adminuser = await this.UserModel.findOne({ where: { user_role: OptionsMessage.USER_ROLE.ADMIN } });
                // if (adminuser) {
                //     let user_response: any = await this.UserModel.findOne({ where: { id: user_id } });
                //     let smtpSettings = await this.settingModel.find();
                //     smtpSettings = JSON.parse(JSON.stringify(smtpSettings))
                //     let template = await this.EmailTemplateModel.findOne({ where: { key: OptionsMessage.EMAIL_TEMPLATE.provider_reject } });
                //     template = JSON.parse(JSON.stringify(template))

                //     let email_data: any = { AdminName: adminuser.name, Username: user_response?.name, Phone_num: user_response?.phone_num }
                //     await CommonService.sendEmail(adminuser.email, email_data, template, smtpSettings,);
                // }
            }
            return { status: true, message: CommonMessages.upload_data('Document'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    // change password =============================
    @Put('changepassword')
    async changePassword(
        @Req() req: any,
    ) {
        try {
            let { old_pass, new_pass, confirm_pass } = req.body
            const user_id = req.user.id;
            const data = await this.ProviderService.changePassword(user_id, old_pass, new_pass, confirm_pass);
            return { status: true, message: CommonMessages.PWD_CHANGE, data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    // get profile =============================
    @Get('admin/profile')
    async getUserProfile(@Req() req: any) {
        try {
            const user_id = req.user.id;
            const data = await this.ProviderService.getUserData(user_id);
            return { status: true, message: CommonMessages.GET_DATA('Profile'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    /// uploadfile =============================
    @Post('/uploadfile')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, callback) => {
                const uniqueFilename = `${new Date().getTime()}-${file.originalname.replace(/ /g, "_")}`; // Generate unique filename
                callback(null, uniqueFilename);
            }
        })
    }))
    async uploadFiles(
        @UploadedFile() file,
    ) {
        try {
            let url = `${process.env.API_BASE_URL}${file.filename}`; // Use generated filename
            return { status: true, message: 'File uploaded successfully', url, data: file };
        } catch (error) {
            ;
            return { status: false, message: 'Error uploading file' };
        }
    }

}
