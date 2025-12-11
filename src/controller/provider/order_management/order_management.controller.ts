// src/template/template.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { OrderService } from './order_management.service';
import { CommonMessages } from 'src/common/common-messages';
import { UserGuard } from 'src/authGuard/user.guard';
import { Order } from 'src/schema/order.schema';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProviderGuard } from 'src/authGuard/provider.guard';
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
@Controller('/provider/product')
@UseGuards(ProviderGuard)
export class OrderController {


    constructor(
        private readonly OrderService: OrderService,
        @InjectRepository(Order)
        private readonly Order: Repository<Order>,
        @InjectRepository(Notification)
        private readonly NotificationModel: Repository<Notification>,
        @InjectRepository(User)
        private readonly User: Repository<User>,

    ) { }


    @Get('order-count')
    async getOrderCount(@Req() req: any) {
        try {
            const user_id = req.user.id;

            const data = await this.OrderService.getOrderCount(user_id);

            return data;
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Get('recent-order')
    async getRecentOrder(@Req() req: any) {
        try {
            const user_id = req.user.id;

            const data = await this.OrderService.getRecentOrder(user_id);

            return data;
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Get('payment-details/:id')
    async getpayment(@Req() req: any, @Param('id') id: string) {
        try {
            const user_id = req.user.id;
 
            const data = await this.OrderService.getpayment(id);

            return data;
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Get('order-list')
    async getOrderList(@Req() req: any) {
        try {
            const user_id = req.user.id;
            const { page = 1, size = 10, s = '', status } = req.query;

            const data = await this.OrderService.getOrderList(page, size, s, user_id, status);

            return data;
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Put('order-cancle/:id')
    async orderCancle(@Param('id') id: number, @Body() updateData: any) {
        try {
            const order = await this.Order.findOne({ where: { id } });

            if (!order) {
                return { status: false, message: CommonMessages.notFound('Order') };
            }

            const realUser = await this.User.findOne({ where: { id: order.user_id } })

            const updateFields = {
                status: 'CANCELBYPROVIDER',
                remark: updateData.remark
            };

            const data = await this.OrderService.updateData(id, updateFields);

            const notificationTitle = "Order Cancel";
            const notificationDescription = `your order has been cancelled by provider`;

           const dataPayload= await this.NotificationModel.save({
                title: notificationTitle,
                description: notificationDescription,
                user_id: realUser.id,
                click_event: 'order',
                createdAt: new Date(),
            });

            const deviceToken = realUser.device_token;
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

            return { status: true, message: CommonMessages.updated_data('Order'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }



    @Put('order-accept/:id')
    async orderACCEPT(@Param('id') id: number, @Body() updateData: any) {
        try {
            const order = await this.Order.findOne({ where: { id } });

            if (!order) {
                return { status: false, message: CommonMessages.notFound('Order') };
            }
            const realUser = await this.User.findOne({ where: { id: order.user_id } })


            const updateFields = {
                status: 'ACCEPTED',
            };

            const data = await this.OrderService.updateData(id, updateFields);

            const notificationTitle = "Order Accept";
            const notificationDescription = `Your order has been accepted by provider`;

            const dataPayload=await this.NotificationModel.save({
                title: notificationTitle,
                description: notificationDescription,
                user_id: realUser.id,
                click_event: 'order',
                createdAt: new Date(),
            });

            const deviceToken = realUser.device_token;
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

            return { status: true, message: CommonMessages.updated_data('Order'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }


    @Put('order-complete/:id')
    async orderCompalate(@Param('id') id: number, @Body() updateData: any) {
        try {
            const order = await this.Order.findOne({ where: { id } });

            if (!order) {
                return { status: false, message: CommonMessages.notFound('Order') };
            }
            const realUser = await this.User.findOne({ where: { id: order.user_id } })

            const updateFields = {
                status: 'DELIVERED',
                delivery_date: new Date()

            };

            const data = await this.OrderService.updateData(id, updateFields);

            const notificationTitle = "Order Delivered";
            const notificationDescription = `Your order has been delivered by provider`;

            const dataPayload =await this.NotificationModel.save({
                title: notificationTitle,
                description: notificationDescription,
                user_id: realUser.id,
                click_event: 'order',
                createdAt: new Date(),
            });

            const deviceToken = realUser.device_token;
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

            return { status: true, message: CommonMessages.updated_data('Order'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }




}

