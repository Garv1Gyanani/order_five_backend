// src/template/template.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { OrderService } from './order_management.service';
import { CommonMessages } from 'src/common/common-messages';
import { UserGuard } from 'src/authGuard/user.guard';
import { Order } from 'src/schema/order.schema';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User_location } from 'src/schema/user_location.schema';
import axios from 'axios';
import { User } from 'src/schema/user.schema';
import { Wallet_req } from 'src/schema/wallet_req.schema';
import { Setting } from 'src/schema/setting.schema';
import CommonService from 'src/common/common.util';
import * as shapefile from 'shapefile';
import * as turf from '@turf/turf';
import * as PriorityQueue from 'js-priority-queue';
import { Graph } from 'graphlib';
import * as path from 'path';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { Notification } from 'src/schema/notification.schema';
dotenv.config();
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CREDENTIALS || '{}')),
    });
}
@Controller('/customer/product')
@UseGuards(UserGuard)
export class OrderController {


    constructor(
        private readonly OrderService: OrderService,
        @InjectRepository(Order)
        private readonly Order: Repository<Order>,
        @InjectRepository(User_location)
        private readonly User_location: Repository<User_location>,
        @InjectRepository(User)
        private readonly User: Repository<User>,
        @InjectRepository(Wallet_req)
        private readonly Wallet_req: Repository<Wallet_req>,
        @InjectRepository(Setting)
        private readonly Setting: Repository<Setting>,
        @InjectRepository(Notification)
        private readonly NotificationModel: Repository<Notification>,


    ) { }

    @Post('/find-nearby-providers')
    async findNearbyProviders(@Body() body: any, @Req() req: any) {
        const { product_id, latitude, longitude, filter = 10, rating = '3-4' } = body;
        console.log(body, "bodyyy")

        const { page = 1, size = 10, s } = req.query;
        const userLogid = req.user.id;

        if (!product_id || !latitude || !longitude) {
            throw new Error('Missing required parameters: product_id, latitude, or longitude');
        }

        return await this.OrderService.findNearbyProviders(
            product_id,
            parseFloat(latitude),
            parseFloat(longitude),
            filter,
            rating,
            userLogid,
            s,
            parseInt(page, 10),
            parseInt(size, 10)
        );
    }


    @Post('/place-order')
    async orderCreate(@Body() createDto: any, @Req() req: any) {
        try {
            const user_id = req.user.id;
            createDto.user_id = user_id;

            if (!createDto.total_price) {
                return { status: false, message: 'Total price is required' };
            }

            const data = await this.OrderService.orderCreate(createDto);
            return { status: true, message: 'Order has been created successfully', data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Post('wallet-cash')
    async createCashWalletData(@Body() createDto: any, @Req() req: any) {
        try {
            let user_id = req.user.id
            createDto.user_id = user_id

            const data = await this.OrderService.createCashWalletData(createDto);
            return { status: true, message: CommonMessages.created_data("Wallet Request"), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }


    @Get('order-list')
    async getOrderList(@Req() req: any) {
        try {
            const user_id = req.user.id;
            const { page = 1, size = 10, s = '' } = req.query;

            const data = await this.OrderService.getOrderList(page, size, s, user_id);

            return data
        } catch (error) {
            return { status: false, message: error.message };
        }
    }
    
    @Get('arrival-order-list')
    async getArrivalOrderList(@Req() req: any) {
        try {
            const user_id = req.user.id;
            const { page = 1, size = 10, s = '' } = req.query;

            const data = await this.OrderService.getArrivalOrderList(page, size, s, user_id);

            return data
        } catch (error) {
            return { status: false, message: error.message };
        }
    }


    @Put('order-cancle/:id')
    async orderCancle(@Req() req: any, @Param('id') id: number, @Body() updateData: { remark: string }) {
        try {
            const user_id = req.user.id;

            const user = await this.User.findOne({ where: { id: user_id } });

            if (!user) {
                return { status: false, message: CommonMessages.notFound('User') };
            }


            const cancllation = await this.Setting.findOne({ where: { key: 'customer_cancel_fees' } })
            const cancel_charge = Number(cancllation.value)

            if (user.wallet_balance < cancel_charge) {
                return { status: false, message: 'Insufficient wallet balance to cancel the order.' };
            }
            const order = await this.Order.findOne({ where: { id } });

            if (!order) {
                return { status: false, message: CommonMessages.notFound('Order') };
            }
            const realUser = await this.User.findOne({ where: { id: order.provider_id } })

            const updatedWalletBalance = user.wallet_balance - cancel_charge;
            await this.User.update({ id: user_id }, { wallet_balance: updatedWalletBalance });

            const transaction_id = CommonService.createTransactionId();
            await this.Wallet_req.create({
                user_id: user.id,
                user_type: 'Customer',
                amount_status: 'Credit',
                wallet_type: 'Online',
                transaction_id,
                currency: 'OMR',
                amount: cancel_charge,
                available_amount: updatedWalletBalance,
                remark: `Order cancellation for Order ID: ${id}`,
                status: 'Approved',
                date: new Date(),
            });

            const updateFields = {
                status: 'CANCELBYCUSTOMER',
                remark: updateData.remark
            };

            const data = await this.OrderService.updateData(id, updateFields);

            const notificationTitle = "Order Cancel";
            const notificationDescription = `your order has been cancelled by customer`;

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


    // async getRouteInfo(start: string, end: string): Promise<{ distance: number; duration: number }> {
    //     try {
    //         const osrmUrl = 'http://router.project-osrm.org/route/v1/driving';
    //         const response = await axios.get(`${osrmUrl}/${start};${end}`, {
    //             params: {
    //                 overview: 'false',
    //                 geometries: 'polyline',
    //             },
    //         });

    //         const route = response.data.routes[0];
    //         return {
    //             distance: route.distance,
    //             duration: route.duration,
    //         };
    //     } catch (error) {
    //         console.error('Error fetching route info', error);
    //         throw new Error('Failed to fetch route info');
    //     }
    // }

    // formatDistance(meters: number): string {
    //     return meters >= 1000
    //         ? `${(meters / 1000).toFixed(1)} km`
    //         : `${meters.toFixed(0)} meters`;
    // }

    // formatDuration(seconds: number): string {
    //     const minutes = Math.floor(seconds / 60);
    //     const hours = Math.floor(minutes / 60);
    //     const remainingMinutes = minutes % 60;

    //     if (hours > 0) {
    //         return `${hours} hour${hours > 1 ? 's' : ''}, ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''
    //             }`;
    //     }
    //     return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    // }

    private async loadRoadData(shapefilePath: string): Promise<any[]> {
        const roads = [];
        return new Promise((resolve, reject) => {
            shapefile
                .open(shapefilePath)
                .then((source) => {
                    source
                        .read()
                        .then(function process(result) {
                            if (result.done) {
                                resolve(roads);
                                return;
                            }
                            roads.push(result.value);
                            return source.read().then(process);
                        })
                        .catch(reject);
                })
                .catch(reject);
        });
    }

    private buildGraph(roads: any[]): any {
        const graph = {};
        roads.forEach((road) => {
            const { start, end, distance } = road.properties;
            if (!graph[start]) graph[start] = [];
            graph[start].push({ to: end, distance });

            if (!graph[end]) graph[end] = [];
            graph[end].push({ to: start, distance });
        });
        return graph;
    }

    private calculateRoute(graph: any, start: any, end: any): { distance: number; duration: number } {
        const distance = Math.sqrt(
            Math.pow(start.lat - end.lat, 2) + Math.pow(start.lon - end.lon, 2)
        ) * 111 * 1000; // Approximation for lat/lon to meters
        const duration = distance / 50; // Assuming average speed of 50km/h
        return { distance, duration };
    }

    private formatDistance(distance: number): string {
        return `${distance.toFixed(2)} km`;
    }

    private formatDuration(duration: number): string {
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        return hours > 0
            ? `${hours}h ${minutes}m`
            : `${minutes}m`;
    }




    @Post('/get-order-trace')
    async getOrderAddressDistance(@Body() body: any) {
        const { order_id } = body;

        if (!order_id) {
            throw new Error('Missing required parameter: order_id');
        }

        try {
            const order = await this.Order.findOne({
                where: { id: order_id },
            });

            if (!order) {
                throw new Error('Order not found');
            }

            const { address_id, provider_id } = order;

            const userAddress = await this.User_location.findOne({
                where: { id: address_id },
            });

            if (!userAddress) {
                throw new Error('User address not found');
            }

            const providerAddress = await this.User_location.findOne({
                where: { user_id: provider_id },
            });

            if (!providerAddress) {
                throw new Error('Provider address not found');
            }
            const shapefilePath = path.join(__dirname, '../../../../src/common/YE_osm_roads_lines_20230523.shp');
            console.log(__dirname, "__dirname")
            console.log(shapefilePath, "shapefilePath")
            const roads = await this.loadRoadData(shapefilePath);
            const graph = this.buildGraph(roads);
            // const { distance, duration } = await this.getRouteInfo(
            //     `${userAddress.longitude},${userAddress.latitude}`,
            //     `${providerAddress.longitude},${providerAddress.latitude}`
            // );

            const { distance, duration } = this.calculateRoute(
                graph,
                { lat: userAddress.latitude, lon: userAddress.longitude },
                { lat: parseFloat(providerAddress.latitude), lon: parseFloat(providerAddress.longitude) }
            );

            const formattedDistance = this.formatDistance(distance);
            const formattedDuration = this.formatDuration(duration);

            return {
                status: true,
                message: 'Addresses and distance fetched successfully',
                data: {
                    userAddress: {
                        latitude: userAddress.latitude,
                        longitude: userAddress.longitude,
                        address: userAddress.address,
                    },
                    providerAddress: {
                        latitude: providerAddress.latitude,
                        longitude: providerAddress.longitude,
                        address: providerAddress.address,
                    },
                    distance: {
                        value: distance / 1000,
                        formatted: formattedDistance,
                    },
                    travelTime: {
                        value: Math.round(duration / 60),
                        formatted: formattedDuration,
                    },
                },
            };
        } catch (error) {
            console.error('Error fetching address and distance', error);
            return {
                status: false,
                message: error.message || 'An error occurred while processing your request',
            };
        }
    }


    @Get('payment-details/:id')
    async getpayment(@Req() req: any, @Param('id') id: string) {
        try {
            const user_id = req.user.id;

            const data = await this.OrderService.getpayment(id);

            return {
                status: true,
                message: 'Transaction data get success',
                data
            };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

}

