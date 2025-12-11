// src/template/template.service.ts
import { Injectable } from '@nestjs/common';
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
import { Op } from 'sequelize';
import { Setting } from 'src/schema/setting.schema';
import * as shapefile from 'shapefile';
import * as turf from '@turf/turf';
import * as PriorityQueue from 'js-priority-queue';
import { Graph } from 'graphlib';
import * as path from 'path';


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

    ) { }



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
    //             distance: route.distance, // in meters
    //             duration: route.duration, // in seconds
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




    async getOrderList(page: number = 1, pageSize: number = 10, search: string = '', user_id: any, status: string = 'UPCOMING') {
        try {
            const { limit, offset } = CommonService.getPagination(page, pageSize);

            const whereCondition: any = { provider_id: user_id };

            if (search) {
                whereCondition['order_id'] = { $ilike: `%${search}%` };
            }

            if (status) {
                whereCondition['status'] = status.toUpperCase();
            }

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
            const customerData = pages.map((order) => order.user_id);

            const providerReview = await this.RatingModel.find({
                where: { order_id: In(cust_review), provider_id: IsNull() }
            })

            const customer_review = await this.RatingModel.find({
                where: { order_id: In(cust_review), customer_id: IsNull() }
            })




            const providers = await this.UserRequestModel.find({
                where: { id: In(providerIds) },
            });
            const address_id = await this.UserLocationModel.find({
                where: { id: In(address) },
            });
            const productDetails = await this.ProductModel.find({
                where: { id: In(productIds) },
            });
            const customerDetails = await this.UserRequestModel.find({
                where: { id: In(customerData) },
            });
            const productRequests = await this.ProductRequestModel.find({
                where: {
                    user_id: In(providerIds),
                    product_id: In(productIds),
                },
            });
            const providers_address = await this.UserLocationModel.find({
                where: { user_id: In(providerIds) },
            });
            const customerRatings = providerIds.length > 0
                ? await this.RatingModel.createQueryBuilder('rating')
                    .select('rating.provider_id', 'provider_id')
                    .addSelect('AVG(rating.rating)', 'averageRating')
                    .addSelect('COUNT(rating.id)', 'totalRatingCount')
                    .where('rating.provider_id IN (:...providerIds)', { providerIds })
                    .groupBy('rating.provider_id')
                    .getRawMany()
                : [];


            const providerRatings = customerIds.length > 0
                ? await this.RatingModel.createQueryBuilder('rating')
                    .select('rating.customer_id', 'customer_id')
                    .addSelect('AVG(rating.rating)', 'averageRating')
                    .addSelect('COUNT(rating.id)', 'totalRatingCount')
                    .where('rating.customer_id IN (:...customerIds)', { customerIds })
                    .groupBy('rating.customer_id')
                    .getRawMany()
                : [];

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
                    const customer = customerDetails.find((p) => p.id === order.user_id);
                    const addressDetails = address_id.find((p) => p.id === order.address_id);
                    const provider_review = providerReview.find((p) => p.order_id === order.id);
                    const customerReview = customer_review.find((p) => p.order_id === order.id);
                    const providerAddress = providers_address.find((p) => p.user_id === order.provider_id);

                    const productRequest = productRequests.find(
                        (pr) => pr.user_id === order.provider_id && pr.product_id === order.product_id
                    );
                    const customerRating = customerRatings.find(
                        (rating) => rating.provider_id === order.provider_id
                    );

                    const providersRatings = providerRatings.find(
                        (rating) => rating.customer_id === order.user_id
                    );

                    const formatRating = (rating: number | null): number | null => {
                        if (rating === null || isNaN(rating)) return null;
                        const rounded = Math.round(rating * 2) / 2;
                        return rounded;
                    };

                    const formattedCustomerAverageRating = formatRating(customerRating?.averageRating || null);
                    const formattedProviderAverageRating = formatRating(providersRatings?.averageRating || null);


                    // // Await the asynchronous operation here
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
                        customer: customer || null,
                        platform_charge: setting.value,
                        cancel_charge: settingcancel.value,
                        customer_review_data: {
                            provider_review: provider_review?.review || null,
                            provider_rating: provider_review?.rating || null,
                            averageRating: formattedProviderAverageRating || null,
                            totalReview: providersRatings?.totalRatingCount || 0,
                        },
                        provider_review_data: {
                            customer_review: customerReview?.review || null,
                            customer_rating: customerReview?.rating || null,
                            averageRating: formattedCustomerAverageRating || null,
                            totalReview: customerRating?.totalRatingCount || 0,
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


            return {
                status: true,
                message: "Order List has been retrieved successfully!",
                data: {
                    totalItems: count,
                    data: orderWithProviderData,
                    totalPages: Math.ceil(count / pageSize),
                    currentPage: Number(page),
                },
            };
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async getOrderCount(user_id: number) {
        try {
            const activeOrderCount = await this.OrderModel.count({
                where: {
                    provider_id:user_id,
                     status: In(['UPCOMING', 'ACCEPTED']),
                },
            }); 

            const completedOrderCount = await this.OrderModel.count({
                where: {
                    provider_id:user_id,
                    status: 'DELIVERED',
                },
            });

            return {
                status: true,
                message: 'Order counts retrieved successfully',
                data: {
                    activeOrders: activeOrderCount,
                    completedOrders: completedOrderCount,
                }, 
            };
        } catch (error) {
            throw new Error(error.message);
        }
    }


    async getRecentOrder(user_id: any) {
        try {
            const whereCondition: any = { provider_id: user_id, status: 'UPCOMING' };

            const orders = await this.OrderModel.find({
                where: whereCondition,
                order: { createdAt: 'DESC' },
                take: 5
            });

            const setting = await this.Setting.findOne({ where: { key: "platform_charge_per_order" } });
            const settingcancel = await this.Setting.findOne({ where: { key: "customer_cancel_fees" } });

            const providerIds = orders.map((order) => order.provider_id);
            const customerIds = orders.map((order) => order.user_id);
            const productIds = orders.map((order) => order.product_id);
            const address = orders.map((order) => order.address_id);
            const cust_review = orders.map((order) => order.id);
            const customerData = orders.map((order) => order.user_id);

            const providerReview = await this.RatingModel.find({
                where: { order_id: In(cust_review), provider_id: IsNull() },
            });

            const customer_review = await this.RatingModel.find({
                where: { order_id: In(cust_review), customer_id: IsNull() },
            });

            const providers = await this.UserRequestModel.find({
                where: { id: In(providerIds) },
            });
            const address_id = await this.UserLocationModel.find({
                where: { id: In(address) },
            });
            const productDetails = await this.ProductModel.find({
                where: { id: In(productIds) },
            });
            const customerDetails = await this.UserRequestModel.find({
                where: { id: In(customerData) },
            });
            const productRequests = await this.ProductRequestModel.find({
                where: {
                    user_id: In(providerIds),
                    product_id: In(productIds),
                },
            });
            const providers_address = await this.UserLocationModel.find({
                where: { user_id: In(providerIds) },
            });

            const customerRatings = providerIds.length > 0
                ? await this.RatingModel.createQueryBuilder('rating')
                    .select('rating.provider_id', 'provider_id')
                    .addSelect('AVG(rating.rating)', 'averageRating')
                    .addSelect('COUNT(rating.id)', 'totalRatingCount')
                    .where('rating.provider_id IN (:...providerIds)', { providerIds })
                    .groupBy('rating.provider_id')
                    .getRawMany()
                : [];

            const providerRatings = customerIds.length > 0
                ? await this.RatingModel.createQueryBuilder('rating')
                    .select('rating.customer_id', 'customer_id')
                    .addSelect('AVG(rating.rating)', 'averageRating')
                    .addSelect('COUNT(rating.id)', 'totalRatingCount')
                    .where('rating.customer_id IN (:...customerIds)', { customerIds })
                    .groupBy('rating.customer_id')
                    .getRawMany()
                : [];

            const shapefilePath = path.join(__dirname, '../../../../src/common/YE_osm_roads_lines_20230523.shp');
            console.log(__dirname, "__dirname");
            console.log(shapefilePath, "shapefilePath");
            const roads = await this.loadRoadData(shapefilePath);
            const graph = this.buildGraph(roads);

            const orderWithProviderData = await Promise.all(
                orders.map(async (order) => {
                    const provider = providers.find((p) => p.id === order.provider_id);
                    const product = productDetails.find((p) => p.id === order.product_id);
                    const customer = customerDetails.find((p) => p.id === order.user_id);
                    const addressDetails = address_id.find((p) => p.id === order.address_id);
                    const provider_review = providerReview.find((p) => p.order_id === order.id);
                    const customerReview = customer_review.find((p) => p.order_id === order.id);
                    const providerAddress = providers_address.find((p) => p.user_id === order.provider_id);

                    const productRequest = productRequests.find(
                        (pr) => pr.user_id === order.provider_id && pr.product_id === order.product_id
                    );
                    const customerRating = customerRatings.find(
                        (rating) => rating.provider_id === order.provider_id
                    );

                    const providersRatings = providerRatings.find(
                        (rating) => rating.customer_id === order.user_id
                    );

                    const formatRating = (rating: number | null): number | null => {
                        if (rating === null || isNaN(rating)) return null;
                        const rounded = Math.round(rating * 2) / 2;
                        return rounded;
                    };

                    const formattedCustomerAverageRating = formatRating(customerRating?.averageRating || null);
                    const formattedProviderAverageRating = formatRating(providersRatings?.averageRating || null);

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
                        customer: customer || null,
                        platform_charge: setting.value,
                        cancel_charge: settingcancel.value,
                        customer_review_data: {
                            provider_review: provider_review?.review || null,
                            provider_rating: provider_review?.rating || null,
                            averageRating: formattedProviderAverageRating || null,
                            totalReview: providersRatings?.totalRatingCount || 0,
                        },
                        provider_review_data: {
                            customer_review: customerReview?.review || null,
                            customer_rating: customerReview?.rating || null,
                            averageRating: formattedCustomerAverageRating || null,
                            totalReview: customerRating?.totalRatingCount || 0,
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

            return {
                status: true,
                message: "Order List has been retrieved successfully!",
                data: orderWithProviderData,
            };
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async getpayment(id: string) {
        try {

            const walletData = await this.Wallet_req.findOne({ where: { transaction_id: id } });
            if (!walletData) {
                throw new Error("No transactrion data was updated.");

            }
            return {
                status: true,
                message: 'Transaction data get success',
                data:walletData
            };
        } catch (error) {
            throw new Error('Error retrieving wallet details: ' + error.message);
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

}
