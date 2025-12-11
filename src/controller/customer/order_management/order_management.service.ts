// src/template/template.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Like, Repository } from 'typeorm';
import { Product } from 'src/schema/product.schema';
import * as bcrypt from 'bcrypt';
import CommonService from 'src/common/common.util';
import { OptionsMessage } from 'src/common/options';
import { CommonMessages } from 'src/common/common-messages';
import { ProductRequest } from 'src/schema/product_request.schema';
import { User } from 'src/schema/user.schema';
import { User_location } from 'src/schema/user_location.schema';
import * as geolib from 'geolib';
import axios from 'axios';
import { Rating } from 'src/schema/rating.schema';
import { ProviderWishlist } from 'src/schema/wishlist.schema';
import { v4 as uuidv4 } from 'uuid';
import { Order } from 'src/schema/order.schema';
import { Wallet_req } from 'src/schema/wallet_req.schema';
import { Op, where } from 'sequelize';
import { Setting } from 'src/schema/setting.schema';
import { readFileSync } from 'fs';
import * as shapefile from 'shapefile';
import * as turf from '@turf/turf';
import * as PriorityQueue from 'js-priority-queue';
import { Graph } from 'graphlib';
import * as path from 'path';
import { Notification } from 'src/schema/notification.schema';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as moment from 'moment-timezone';

dotenv.config();
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CREDENTIALS || '{}')),
    });
}
@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Product)
        private readonly ProductModel: Repository<Product>,
        @InjectRepository(ProductRequest)
        private readonly ProductRequestModel: Repository<ProductRequest>,
        @InjectRepository(User)
        private readonly UserRequestModel: Repository<User>,
        @InjectRepository(User_location)
        private readonly UserLocationModel: Repository<User_location>,
        @InjectRepository(Rating)
        private readonly RatingModel: Repository<Rating>,
        @InjectRepository(ProviderWishlist)
        private readonly WishlistModel: Repository<ProviderWishlist>,
        @InjectRepository(Order)
        private readonly OrderModel: Repository<Order>,
        @InjectRepository(Wallet_req)
        private readonly Wallet_req: Repository<Wallet_req>,
        @InjectRepository(Setting)
        private readonly Setting: Repository<Setting>,
        @InjectRepository(Notification)
        private readonly NotificationModel: Repository<Notification>,

    ) { }



    // async findNearbyProviders(productId: number, latitude: number, longitude: number) {
    //     // Step 1: Get all ProductRequests for the given product_id with status = 'Approved'
    //     const productRequests = await this.ProductRequestModel.find({
    //       where: { product_id: productId, status: 'Approved' },
    //     });

    //     if (!productRequests.length) {
    //       return { message: 'No providers found for this product' };
    //     }

    //     const userIds = productRequests.map((req) => req.user_id);

    //     // Step 2: Fetch user locations for these providers
    //     const userLocations = await this.UserLocationModel
    //       .createQueryBuilder('user_location')
    //       .where('user_location.user_id IN (:...userIds)', { userIds })
    //       .getMany();

    //     if (!userLocations.length) {
    //       return { message: 'No location data available for these providers' };
    //     }

    //     // Step 3: Filter and calculate distances using geolib (Haversine formula)
    //     const nearbyUsers = userLocations.filter((location) => {
    //       const distance = this.calculateDistance(
    //         latitude,
    //         longitude,
    //         parseFloat(location.latitude),
    //         parseFloat(location.longitude),
    //       );
    //       return distance <= 100000; // Only consider users within 10 km radius
    //     });

    //     if (!nearbyUsers.length) {
    //       return { message: 'No providers found within 10 km radius' };
    //     }

    //     // Step 4: Calculate travel time using a fixed average speed (e.g., 40 km/h)
    //     const providersWithDetails = await Promise.all(
    //       nearbyUsers.map(async (location) => {
    //         try {
    //           const distance = this.calculateDistance(
    //             latitude,
    //             longitude,
    //             parseFloat(location.latitude),
    //             parseFloat(location.longitude),
    //           );

    //           // Approximate travel time based on average speed (40 km/h)
    //           const averageSpeed = 40; // 40 km/h as an example
    //           const travelTimeInMinutes = (distance / averageSpeed) * 60;

    //           return {
    //             user_id: location.user_id,
    //             latitude: location.latitude,
    //             longitude: location.longitude,
    //             address: location.address,
    //             distance: {
    //               value: distance, // Distance in km
    //               formatted: this.formatDistance(distance),
    //             },
    //             travelTime: {
    //               value: Math.round(travelTimeInMinutes), // Travel time in minutes
    //               formatted: this.formatDuration(travelTimeInMinutes),
    //             },
    //           };
    //         } catch (error) {
    //           console.error('Error calculating distance and time for user', location.user_id, error);
    //           return null; // Handle error gracefully
    //         }
    //       }),
    //     );

    //     // Filter out null results
    //     const validProviders = providersWithDetails.filter((provider) => provider !== null);

    //     // Sort results by distance
    //     const sortedResults = validProviders.sort(
    //       (a, b) => a.distance.value - b.distance.value,
    //     );

    //     return {
    //       message: 'Nearby providers fetched successfully',
    //       providers: sortedResults,
    //     };
    //   }

    //   // Helper function to calculate the distance using geolib
    //   calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    //     return geolib.getDistance(
    //       { latitude: lat1, longitude: lon1 },
    //       { latitude: lat2, longitude: lon2 },
    //     ) / 1000; // Return distance in kilometers
    //   }

    //   // Helper function to format distance
    //   formatDistance(km: number): string {
    //     return km >= 1
    //       ? `${km.toFixed(1)} km`
    //       : `${(km * 1000).toFixed(0)} meters`;
    //   }

    //   // Helper function to format travel time
    //   formatDuration(minutes: number): string {
    //     const hours = Math.floor(minutes / 60);
    //     const remainingMinutes = minutes % 60;
    //     if (hours > 0) {
    //       return `${hours} hour${hours > 1 ? 's' : ''}, ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
    //     }
    //     return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    //   }


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




    private async getAverageRatings(providerIds: number[]): Promise<any[]> {
        return await this.RatingModel
            .createQueryBuilder('rating')
            .select('rating.provider_id', 'provider_id')
            .addSelect('AVG(rating.rating)', 'averageRating')
            .addSelect('COUNT(rating.id)', 'totalRatingCount')
            .where('rating.provider_id IN (:...providerIds)', { providerIds })
            .groupBy('rating.provider_id')
            .getRawMany();
    }

    async findNearbyProviders(
        productId: number,
        latitude: number,
        longitude: number,
        filter: number,
        rating: string | number,
        userLogid: number,
        s: string = '',
        page: number,
        size: number
    ): Promise<any> {
        // uploads\YE_osm_roads_lines_20230523.shp
        const shapefilePath = path.join(__dirname, '../../../../src/common/YE_osm_roads_lines_20230523.shp');
        console.log(__dirname, "__dirname")
        console.log(shapefilePath, "shapefilePath")
        const roads = await this.loadRoadData(shapefilePath);
        const graph = this.buildGraph(roads);

        const userwallet = await this.UserRequestModel.findOne({ where: { id: userLogid } });
        const useraddress = await this.UserLocationModel.findOne({ where: { user_id: userLogid, default: 1 } });
        const setting = await this.Setting.findOne({ where: { key: "platform_charge_per_order" } });
        const productRequests = await this.ProductRequestModel.find({ where: { product_id: productId, status: 'Approved' } });
        const product = await this.ProductModel.findOne({ where: { id: productId } });

        if (!productRequests.length) {

            throw new NotFoundException('No providers found for this product');
        }

        const userIds = productRequests.map((req) => req.user_id);

        const userLocations = await this.UserLocationModel
            .createQueryBuilder('user_location')
            .where('user_location.user_id IN (:...userIds)', { userIds })
            .getMany();

        if (!userLocations.length) {

            throw new NotFoundException('No location data available for these providers');
        }

        const wishlist = await this.WishlistModel.find({ where: { user_id: userLogid } });
        const wishlistProviderIds = wishlist.map((item) => item.provider_id);

        const ratings = await this.RatingModel.createQueryBuilder('rating')
            .where('rating.provider_id IN (:...userIds)', { userIds: userLocations.map((user) => user.user_id) })
            .getMany();

        const RatingModel = await this.getAverageRatings(userIds);

        let minRating = 0;
        let maxRating = 5;
        if (typeof rating === 'string' && rating.includes('-')) {
            const ratingRange = rating.split('-');
            minRating = parseInt(ratingRange[0], 10);
            maxRating = parseInt(ratingRange[1], 10);
        } else if (typeof rating === 'number') {
            minRating = rating;
            maxRating = rating;
        }

        const filteredProviders = await Promise.all(
            userLocations.map(async (location) => {

                try {
                    const { distance, duration } = this.calculateRoute(
                        graph,
                        { lat: latitude, lon: longitude },
                        { lat: parseFloat(location.latitude), lon: parseFloat(location.longitude) }
                    );

                    console.log(distance, duration)

                    const distanceInKm = distance / 1000;
                    if (filter && distanceInKm > filter) {
                        return null;
                    }

                    const userRatings = ratings.filter((r) => r.provider_id === location.user_id);
                    const ratingReal = RatingModel.find((r) => r.provider_id === location.user_id);
                    const reviewCount = userRatings.length;
                    // const averageRating = reviewCount
                    //     ? userRatings.reduce((sum, r) => sum + r.rating, 0) / reviewCount
                    //     : 0;
                    const averageRating = reviewCount
                    ? Math.round((userRatings.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 2) / 2
                    : 0;
                
                    if (averageRating < minRating || averageRating > maxRating) return null;

                    const productRequest = productRequests.find((req) => req.user_id === location.user_id);

                    const userDetails = await this.UserRequestModel.findOne({
                        where: {
                            id: location.user_id,
                            current_status:true,
                            name: s ? Like(`%${s}%`) : undefined,
                        }
                    });

                    if (!userDetails) return null;

                    const isWish = wishlistProviderIds.includes(location.user_id);

                    return {
                        user_id: location.user_id,
                        latitude: location.latitude,
                        longitude: location.longitude,
                        address: location.address,
                        distance: {
                            value: distanceInKm,
                            formatted: this.formatDistance(distance),
                        },
                        travelTime: {
                            value: Math.round(duration / 60),
                            formatted: this.formatDuration(duration),
                        },
                        product,
                        product_charges: productRequest,
                        userDetails,
                        reviewCount,
                        averageRating: ratingReal?.averageRating
                        ? (Math.round(ratingReal.averageRating * 2) / 2).toFixed(1)
                        : null,
                        isWish,
                        userwallet: userwallet.wallet_balance,
                        useraddress,
                        plat_form_charge: setting.value,
                    };
                } catch (error) {

                    console.error('Error fetching distance and time for user', location.user_id, error);
                    return null;
                }
            })
        );

        const validProviders = filteredProviders.filter((provider) => provider !== null);
        if (validProviders.length === 0) {
            return {
                status: true,
                message: 'No providers found with the given name or rating',
                data: {
                    totalItems: 0,
                    data: [],
                    totalPages: 0,
                    currentPage: 0,
                },
            };
        }

        const sortedResults = validProviders.sort((a, b) => a.distance.value - b.distance.value);

        const totalItems = sortedResults.length;
        const totalPages = Math.ceil(totalItems / size);
        const offset = (page - 1) * size;
        const paginatedResults = sortedResults.slice(offset, offset + size);

        return {
            status: true,
            message: 'Nearby providers fetched successfully',
            data: {
                totalItems,
                data: paginatedResults,
                totalPages,
                currentPage: page,
            },
        };
    }




    async orderCreate(data: any) {
        try {
            const orderUUID = `ODI-${Math.random().toString(36).substr(2, Math.floor(Math.random() * (6 - 4 + 1)) + 4).toUpperCase()}`;
            data.order_id = orderUUID;

            const user = await this.UserRequestModel.findOne({ where: { id: data.user_id } });
            if (!user) {
                throw new Error('User not found');
            }

            const product = await this.ProductModel.findOne({ where: { id: data.product_id } });
            if (!product) {
                throw new Error('Product not found');
            }

            const provider = await this.UserRequestModel.findOne({ where: { id: data.provider_id } });
            if (!provider) {
                throw new Error('provider not found');
            }

            const walletBalance = user.wallet_balance || 0;
            const platformCharge = data.platform_charge || 0;
            const totalPrice = data.total_price;

            if (totalPrice <= 0 || platformCharge <= 0) {
                throw new Error('Invalid total price or platform charge');
            }

            if (walletBalance < platformCharge) {
                throw new Error('You do not have enough balance in your wallet');
            }

            user.wallet_balance -= platformCharge;

            data.wallet = platformCharge;
            data.cash = totalPrice;
            data.totalprice = totalPrice;
            data.status = 'UPCOMING';

            await this.UserRequestModel.update(user.id, { wallet_balance: user.wallet_balance });
            data.createdAt = moment.tz('Asia/Riyadh').format('YYYY-MM-DD HH:mm:ss');  

            const newOrder: any = await this.OrderModel.create(data);
            const newOrderRequest = await this.OrderModel.save(newOrder);

            const transaction_id = CommonService.createTransactionId();

            const walletTransaction = this.Wallet_req.create({
                user_id: user.id,
                user_type: 'Customer',
                amount_status: 'Debit',
                wallet_type: 'Online',
                transaction_id,
                currency: 'OMR',
                amount: platformCharge,
                available_amount: user.wallet_balance,
                remark: product.product_name,
                order_type:'order',
                status: 'Approved',
                date: new Date(),
            });

            await this.Wallet_req.save(walletTransaction);

            const notificationTitle = "Order place";
            const notificationDescription = `Order has been placed.`;

           const dataPayload= await this.NotificationModel.save({
                title: notificationTitle,
                description: notificationDescription,
                user_id: provider.id,
                click_event: 'order',
                createdAt: new Date(),
            });

            const deviceToken = provider.device_token;
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

            return {
                ...newOrderRequest,
                product_details: {
                    id: product.id,
                    name: product.product_name,
                    description: product.description_name,
                    image: product.product_img,
                },
                provider_details: {
                    id: provider.id,
                    name: provider.name,
                    phone: provider.phone_num,
                    image: provider.image_url,

                },
            };
        } catch (error) {
            throw new Error(`Failed to create order: ${error.message}`);
        }
    }



    async createCashWalletData(data: any) {
        try {
            if (!data.transaction_id) {
                let transaction_id = CommonService.createTransactionId();
                data.transaction_id = transaction_id;
            }

            data.status = 'Approved';
            data.amount_status = 'Debited';

            let newWalletRequest: any = await this.Wallet_req.create(data);
            newWalletRequest = await this.Wallet_req.save(newWalletRequest);

            return newWalletRequest;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async getOrderList(page: number = 1, pageSize: number = 10, search: string = '', user_id: any, productNameSearch: string = '') {
        try {
            const { limit, offset } = CommonService.getPagination(page, pageSize);

            const whereCondition: any = { user_id };


            const [pages, count] = await this.OrderModel.findAndCount({
                where: whereCondition,
                skip: offset,
                take: limit,
                order: { createdAt: 'DESC' },
            });

            const setting = await this.Setting.findOne({ where: { key: "platform_charge_per_order" } });
            const settingcancel = await this.Setting.findOne({ where: { key: "customer_cancel_fees" } });

            const providerIds = pages.map((order) => order.provider_id);
            const customerIds = pages.map((order) => order.user_id);
            const productIds = pages.map((order) => order.product_id);
            const address = pages.map((order) => order.address_id);
            const cust_review = pages.map((order) => order.id);
            const providers = await this.UserRequestModel.find({
                where: { id: In(providerIds) },
            });

            const providers_address = await this.UserLocationModel.find({
                where: { user_id: In(providerIds) },
            });
            const address_id = await this.UserLocationModel.find({
                where: { id: In(address) },
            });
            const customerReview = await this.RatingModel.find({
                where: { order_id: In(cust_review), customer_id: IsNull() }
            })

            const providerReview = await this.RatingModel.find({
                where: { order_id: In(cust_review), provider_id: IsNull() }
            })

            const productDetails = await this.ProductModel.find({
                where: { id: In(productIds) },
            });
            const productRequests = await this.ProductRequestModel.find({
                where: {
                    user_id: In(providerIds),
                    product_id: In(productIds),
                },
            });
            // const ratings = await this.RatingModel.find({
            //     where: { provider_id: In(providerIds) },
            // });

            // const providerRatings = await this.RatingModel.createQueryBuilder('rating')
            //     .select('rating.provider_id', 'provider_id')
            //     .addSelect('AVG(rating.rating)', 'averageRating')
            //     .addSelect('COUNT(rating.id)', 'totalRatingCount')
            //     .where('rating.provider_id IN (:...providerIds)', { providerIds })
            //     .groupBy('rating.provider_id')
            //     .getRawMany();

            let providerRatings = [];
            if (providerIds.length > 0) {
                providerRatings = await this.RatingModel.createQueryBuilder('rating')
                    .select('rating.provider_id', 'provider_id')
                    .addSelect('AVG(rating.rating)', 'averageRating')
                    .addSelect('COUNT(rating.id)', 'totalRatingCount')
                    .where('rating.provider_id IN (:...providerIds)', { providerIds })
                    .groupBy('rating.provider_id')
                    .getRawMany();
            } else {
                providerRatings = [];
            }


            let customerRatings = [];
            if (customerIds.length > 0) {
                customerRatings = await this.RatingModel.createQueryBuilder('rating')
                    .select('rating.customer_id', 'customer_id')
                    .addSelect('AVG(rating.rating)', 'averageRating')
                    .addSelect('COUNT(rating.id)', 'totalRatingCount')
                    .where('rating.customer_id IN (:...customerIds)', { customerIds })
                    .groupBy('rating.customer_id')
                    .getRawMany();
            } else {
                customerRatings = [];

            }

            // const customerRatings = await this.RatingModel.createQueryBuilder('rating')
            //     .select('rating.customer_id', 'customer_id')
            //     .addSelect('AVG(rating.rating)', 'averageRating')
            //     .addSelect('COUNT(rating.id)', 'totalRatingCount')
            //     .where('rating.customer_id IN (:...customerIds)', { customerIds })
            //     .groupBy('rating.customer_id')
            //     .getRawMany();



            const paginatedData = CommonService.getPagingData(
                { count, rows: pages },
                page,
                limit
            );
            const shapefilePath = path.join(__dirname, '../../../../src/common/YE_osm_roads_lines_20230523.shp');
            console.log(__dirname, "__dirname")
            console.log(shapefilePath, "shapefilePath")
            const roads = await this.loadRoadData(shapefilePath);
            const graph = this.buildGraph(roads);
            const orderWithProviderData = await Promise.all(
                paginatedData.data.map(async (order) => {
                    const provider = providers.find((p) => p.id === order.provider_id);
                    const product = productDetails.find((p) => p.id === order.product_id);
                    const addressDetails = address_id.find((p) => p.id === order.address_id);
                    const providerAddress = providers_address.find((p) => p.user_id === order.provider_id);
                    const customer_review = customerReview.find((p) => p.order_id === order.id);
                    const provider_review = providerReview.find((p) => p.order_id === order.id);
                    const productRequest = productRequests.find(
                        (pr) => pr.user_id === order.provider_id && pr.product_id === order.product_id
                    );

                    const providerRating = providerRatings.find(
                        (rating) => rating.provider_id === order.provider_id
                    );

                    const customersRating = customerRatings.find(
                        (rating) => rating?.customer_id === order.user_id
                    );


                    const formatRating = (rating: number | null): number | null => {
                        if (rating === null || isNaN(rating)) return null;
                        const rounded = Math.round(rating * 2) / 2;
                        return rounded;
                    };

                    const formattedCustomerAverageRating = formatRating(customersRating?.averageRating || null);
                    const formattedProviderAverageRating = formatRating(providerRating?.averageRating || null);


                    // const { distance, duration } = await this.getRouteInfo(
                    //     `${addressDetails.longitude},${addressDetails.latitude}`,
                    //     `${providerAddress.longitude},${providerAddress.latitude}`
                    // );


                    const { distance, duration } = this.calculateRoute(
                        graph,
                        { lat: addressDetails.latitude, lon: addressDetails.longitude },
                        { lat: parseFloat(providerAddress.latitude), lon: parseFloat(providerAddress.longitude) }
                    );


                    const formattedDistance = this.formatDistance(distance);
                    const formattedDuration = this.formatDuration(duration);


                    return {
                        ...order,
                        providerDetails: provider || null,
                        productDetails: product || null,
                        productChargeDetails: productRequest || null,
                        addressDetails: addressDetails || null,
                        platform_charge: setting.value,
                        cancel_charge: settingcancel.value,
                        provider_review_data: {
                            customer_review: provider_review?.review || null,
                            rating: provider_review?.rating || null,
                            averageRating: formattedCustomerAverageRating || null,
                            totalReview: providerRating?.totalRatingCount || 0,

                        },
                        customer_review_data: {
                            provider_review: customer_review?.review || null,
                            rating: customer_review?.rating || null,
                            averageRating: formattedProviderAverageRating || null,
                            totalReview: customersRating?.totalRatingCount || 0,

                        },
                        timing: {
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
                })
            );

            const filteredOrders = orderWithProviderData.filter((order) => {
                if (search) {
                    const productNameMatch = order.productDetails?.product_name
                        ?.toLowerCase()
                        .includes(search.toLowerCase());
                    const providerNameMatch = order.providerDetails?.name
                        ?.toLowerCase()
                        .includes(search.toLowerCase());
                    const status = order?.status
                        ?.toLowerCase()
                        .includes(search.toLowerCase());
                    const order_id = order?.order_id
                        ?.toLowerCase()
                        .includes(search.toLowerCase());

                    return productNameMatch || providerNameMatch || status || order_id;
                }
                return true;
            });


            return {
                status: true,
                message: "Order List has been retrieved successfully!",
                data: {
                    totalItems: count,
                    data: filteredOrders,
                    totalPages: Math.ceil(count / pageSize),
                    currentPage: Number(page),
                },
            };
        } catch (error) {
            throw new Error(error.message);
        }
    }


    async getArrivalOrderList(page: number = 1, pageSize: number = 10, search: string = '', user_id: any, productNameSearch: string = '') {
        try {
            const { limit, offset } = CommonService.getPagination(page, pageSize);

            const whereCondition: any = { user_id ,status:'ACCEPTED' };


            const [pages, count] = await this.OrderModel.findAndCount({
                where: whereCondition,
                skip: offset,
                take: limit,
                order: { createdAt: 'DESC' },
            });

            const setting = await this.Setting.findOne({ where: { key: "platform_charge_per_order" } });
            const settingcancel = await this.Setting.findOne({ where: { key: "customer_cancel_fees" } });

            const providerIds = pages.map((order) => order.provider_id);
            const customerIds = pages.map((order) => order.user_id);
            const productIds = pages.map((order) => order.product_id);
            const address = pages.map((order) => order.address_id);
            const cust_review = pages.map((order) => order.id);
            const providers = await this.UserRequestModel.find({
                where: { id: In(providerIds) },
            });

            const providers_address = await this.UserLocationModel.find({
                where: { user_id: In(providerIds) },
            });
            const address_id = await this.UserLocationModel.find({
                where: { id: In(address) },
            });
            const customerReview = await this.RatingModel.find({
                where: { order_id: In(cust_review), customer_id: IsNull() }
            })

            const providerReview = await this.RatingModel.find({
                where: { order_id: In(cust_review), provider_id: IsNull() }
            })

            const productDetails = await this.ProductModel.find({
                where: { id: In(productIds) },
            });
            const productRequests = await this.ProductRequestModel.find({
                where: {
                    user_id: In(providerIds),
                    product_id: In(productIds),
                },
            });
            // const ratings = await this.RatingModel.find({
            //     where: { provider_id: In(providerIds) },
            // });

            // const providerRatings = await this.RatingModel.createQueryBuilder('rating')
            //     .select('rating.provider_id', 'provider_id')
            //     .addSelect('AVG(rating.rating)', 'averageRating')
            //     .addSelect('COUNT(rating.id)', 'totalRatingCount')
            //     .where('rating.provider_id IN (:...providerIds)', { providerIds })
            //     .groupBy('rating.provider_id')
            //     .getRawMany();

            let providerRatings = [];
            if (providerIds.length > 0) {
                providerRatings = await this.RatingModel.createQueryBuilder('rating')
                    .select('rating.provider_id', 'provider_id')
                    .addSelect('AVG(rating.rating)', 'averageRating')
                    .addSelect('COUNT(rating.id)', 'totalRatingCount')
                    .where('rating.provider_id IN (:...providerIds)', { providerIds })
                    .groupBy('rating.provider_id')
                    .getRawMany();
            } else {
                providerRatings = [];
            }


            let customerRatings = [];
            if (customerIds.length > 0) {
                customerRatings = await this.RatingModel.createQueryBuilder('rating')
                    .select('rating.customer_id', 'customer_id')
                    .addSelect('AVG(rating.rating)', 'averageRating')
                    .addSelect('COUNT(rating.id)', 'totalRatingCount')
                    .where('rating.customer_id IN (:...customerIds)', { customerIds })
                    .groupBy('rating.customer_id')
                    .getRawMany();
            } else {
                customerRatings = [];

            }

            // const customerRatings = await this.RatingModel.createQueryBuilder('rating')
            //     .select('rating.customer_id', 'customer_id')
            //     .addSelect('AVG(rating.rating)', 'averageRating')
            //     .addSelect('COUNT(rating.id)', 'totalRatingCount')
            //     .where('rating.customer_id IN (:...customerIds)', { customerIds })
            //     .groupBy('rating.customer_id')
            //     .getRawMany();



            const paginatedData = CommonService.getPagingData(
                { count, rows: pages },
                page,
                limit
            );
            const shapefilePath = path.join(__dirname, '../../../../src/common/YE_osm_roads_lines_20230523.shp');
            console.log(__dirname, "__dirname")
            console.log(shapefilePath, "shapefilePath")
            const roads = await this.loadRoadData(shapefilePath);
            const graph = this.buildGraph(roads);
            const orderWithProviderData = await Promise.all(
                paginatedData.data.map(async (order) => {
                    const provider = providers.find((p) => p.id === order.provider_id);
                    const product = productDetails.find((p) => p.id === order.product_id);
                    const addressDetails = address_id.find((p) => p.id === order.address_id);
                    const providerAddress = providers_address.find((p) => p.user_id === order.provider_id);
                    const customer_review = customerReview.find((p) => p.order_id === order.id);
                    const provider_review = providerReview.find((p) => p.order_id === order.id);
                    const productRequest = productRequests.find(
                        (pr) => pr.user_id === order.provider_id && pr.product_id === order.product_id
                    );

                    const providerRating = providerRatings.find(
                        (rating) => rating.provider_id === order.provider_id
                    );

                    const customersRating = customerRatings.find(
                        (rating) => rating?.customer_id === order.user_id
                    );


                    const formatRating = (rating: number | null): number | null => {
                        if (rating === null || isNaN(rating)) return null;
                        const rounded = Math.round(rating * 2) / 2;
                        return rounded;
                    };

                    const formattedCustomerAverageRating = formatRating(customersRating?.averageRating || null);
                    const formattedProviderAverageRating = formatRating(providerRating?.averageRating || null);


                    // const { distance, duration } = await this.getRouteInfo(
                    //     `${addressDetails.longitude},${addressDetails.latitude}`,
                    //     `${providerAddress.longitude},${providerAddress.latitude}`
                    // );


                    const { distance, duration } = this.calculateRoute(
                        graph,
                        { lat: addressDetails.latitude, lon: addressDetails.longitude },
                        { lat: parseFloat(providerAddress.latitude), lon: parseFloat(providerAddress.longitude) }
                    );


                    const formattedDistance = this.formatDistance(distance);
                    const formattedDuration = this.formatDuration(duration);


                    return {
                        ...order,
                        providerDetails: provider || null,
                        productDetails: product || null,
                        productChargeDetails: productRequest || null,
                        addressDetails: addressDetails || null,
                        platform_charge: setting.value,
                        cancel_charge: settingcancel.value,
                        provider_review_data: {
                            customer_review: provider_review?.review || null,
                            rating: provider_review?.rating || null,
                            averageRating: formattedCustomerAverageRating || null,
                            totalReview: providerRating?.totalRatingCount || 0,

                        },
                        customer_review_data: {
                            provider_review: customer_review?.review || null,
                            rating: customer_review?.rating || null,
                            averageRating: formattedProviderAverageRating || null,
                            totalReview: customersRating?.totalRatingCount || 0,

                        },
                        timing: {
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
                })
            );

            const filteredOrders = orderWithProviderData.filter((order) => {
                if (search) {
                    const productNameMatch = order.productDetails?.product_name
                        ?.toLowerCase()
                        .includes(search.toLowerCase());
                    const providerNameMatch = order.providerDetails?.name
                        ?.toLowerCase()
                        .includes(search.toLowerCase());
                    const status = order?.status
                        ?.toLowerCase()
                        .includes(search.toLowerCase());
                    const order_id = order?.order_id
                        ?.toLowerCase()
                        .includes(search.toLowerCase());

                    return productNameMatch || providerNameMatch || status || order_id;
                }
                return true;
            });


            return {
                status: true,
                message: "Order List has been retrieved successfully!",
                data: {
                    totalItems: count,
                    data: filteredOrders,
                    totalPages: Math.ceil(count / pageSize),
                    currentPage: Number(page),
                },
            };
        } catch (error) {
            throw new Error(error.message);
        }
    }


    async updateData(id: number, updateData: any) {
        try {
            let response = await this.OrderModel.update(id, updateData);
            if (response[0] === 0) {
                throw new Error("No Product data was updated.");
            }
            return response
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async getpayment(id: string) {
        try {
            const walletData = await this.Wallet_req.findOne({ where: { transaction_id: id } });3
            if(!walletData){
                throw new Error("No transactrion data was updated.");

            }
            return walletData;
        } catch (error) {
            throw new Error('Error retrieving wallet details: ' + error.message);
        }
    }
}
