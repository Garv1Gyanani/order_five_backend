// src/template/template.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Like, Repository } from 'typeorm';
import { Product } from 'src/schema/product.schema';
import * as bcrypt from 'bcryptjs';
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




    async getOrderList(page: number = 1, pageSize: number = 10, search: string = '', status: any) {
        try {
            const { limit, offset } = CommonService.getPagination(page, pageSize);

            let whereCondition: any = {};
            if (status && status.toLowerCase() !== 'all') {
                whereCondition['status'] = status.toUpperCase();
            }

            const [pages, count] = await this.OrderModel.findAndCount({
                where: whereCondition,
                skip: offset,
                take: limit,
                order: { createdAt: 'DESC' },
            });

            const customerIds = pages.map((order) => order.user_id);
            const providerIds = pages.map((order) => order.provider_id);
            const productIds = pages.map((order) => order.product_id);

            const providers = await this.UserRequestModel.find({
                where: { id: In(providerIds) },
            });
            const customers = await this.UserRequestModel.find({
                where: { id: In(customerIds) },
            });
            const productDetails = await this.ProductModel.find({
                where: { id: In(productIds) },
            });
            const productRequests = await this.ProductRequestModel.find({
                where: {
                    user_id: In(providerIds),
                    product_id: In(productIds),
                },
            });

            const paginatedData = CommonService.getPagingData(
                { count, rows: pages },
                page,
                limit
            );

            const orderWithProviderData = paginatedData.data
                .map((order) => {
                    const provider = providers.find((p) => p.id === order.provider_id);
                    const customer = customers.find((p) => p.id === order.user_id);
                    const product = productDetails.find((p) => p.id === order.product_id);
                    const productRequest = productRequests.find(
                        (pr) => pr.user_id === order.provider_id && pr.product_id === order.product_id
                    );

                    return {
                        ...order,
                        customerDetails: customer || null,
                        providerDetails: provider || null,
                        productDetails: product || null,
                        productChargeDetails: productRequest || null,
                    };
                })
                .filter((order) => {
                    if (search) {
                        const productNameMatch = order.productDetails?.product_name
                            ?.toLowerCase()
                            .includes(search.toLowerCase());
                        const providerNameMatch = order.providerDetails?.name
                            ?.toLowerCase()
                            .includes(search.toLowerCase());
                        const order_id = order.order_id
                            ?.toLowerCase()
                            .includes(search.toLowerCase());
                        const customername = order.customerDetails?.name
                            ?.toLowerCase()
                            .includes(search.toLowerCase());

                        return productNameMatch || providerNameMatch || customername || order_id;
                    }
                    return true;
                });

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


    async getOrderListById(page: number = 1, pageSize: number = 10, id: number) {
        try {
            const { limit, offset } = CommonService.getPagination(page, pageSize);

            const [pages, count] = await this.OrderModel.findAndCount({
                where: { provider_id: id },
                skip: offset,
                take: limit,
                order: { createdAt: 'DESC' },
            });

            const customerIds = pages.map((order) => order.user_id);
            const providerIds = pages.map((order) => order.provider_id);
            const productIds = pages.map((order) => order.product_id);
            const address_id = pages.map((order) => order.address_id);
            const orderIDs = pages.map((order) => order.id);

            const providers = await this.UserRequestModel.find({
                where: { id: In(providerIds) },
            });
            const customers = await this.UserRequestModel.find({
                where: { id: In(customerIds) },
            });
            const address = await this.UserLocationModel.find({
                where: { id: In(address_id) },
            });
            const customersrating = await this.RatingModel.find({
                where: { order_id: In(orderIDs), customer_id: In(customerIds), provider_id: IsNull() },
            });

            const providersrating = await this.RatingModel.find({
                where: { order_id: In(orderIDs), provider_id: In(providerIds), customer_id: IsNull() },
            });
            const productDetails = await this.ProductModel.find({
                where: { id: In(productIds) },
            });
            const productRequests = await this.ProductRequestModel.find({
                where: {
                    user_id: In(providerIds),
                    product_id: In(productIds),
                },
            });

            const paginatedData = CommonService.getPagingData(
                { count, rows: pages },
                page,
                limit
            );

            const orderWithProviderData = paginatedData.data
                .map((order) => {
                    const provider = providers.find((p) => p.id === order.provider_id);
                    const customer = customers.find((p) => p.id === order.user_id);
                    const product = productDetails.find((p) => p.id === order.product_id);
                    const addressDetails = address.find((p) => p.id === order.address_id);
                    const customerRating = customersrating.find((p) => p.order_id === order.id);
                    const ProviderRating = providersrating.find((p) => p.order_id === order.id);
                    const productRequest = productRequests.find(
                        (pr) => pr.user_id === order.provider_id && pr.product_id === order.product_id
                    );

                    return {
                        ...order,
                        customerDetails: customer || null,
                        providerDetails: provider || null,
                        productDetails: product || null,
                        productChargeDetails: productRequest || null,
                        customerRating: customerRating?.rating || null,
                        ProviderRating: ProviderRating?.rating || null,
                        addressDetails: addressDetails || null

                    };
                })


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

    async OrderListById(id: number) {
        try {
            const pages = await this.OrderModel.find({
                where: { id },
                order: { createdAt: 'DESC' },
            });

            if (pages.length === 0) {
                return {
                    status: false,
                    message: "No order found with this ID.",
                    data: null,
                };
            }




            const order = pages[0];

            const userAddress = await this.UserLocationModel.findOne({
                where: { id: order.address_id },
            });

            if (!userAddress) {
                throw new Error('User address not found');
            }

            const providerAddress = await this.UserLocationModel.findOne({
                where: { user_id: order.provider_id },
            });

            if (!providerAddress) {
                throw new Error('Provider address not found');
            }

            // const { distance, duration } = await this.getRouteInfo(
            //     `${userAddress.longitude},${userAddress.latitude}`,
            //     `${providerAddress.longitude},${providerAddress.latitude}`
            // );

            const shapefilePath = path.join(__dirname, '../../../../src/common/YE_osm_roads_lines_20230523.shp');
            console.log(__dirname, "__dirname")
            console.log(shapefilePath, "shapefilePath")
            const roads = await this.loadRoadData(shapefilePath);
            const graph = this.buildGraph(roads);


            const { distance, duration } = this.calculateRoute(
                graph,
                { lat: userAddress.latitude, lon: userAddress.longitude },
                { lat: parseFloat(providerAddress.latitude), lon: parseFloat(providerAddress.longitude) }
            );

            const formattedDistance = this.formatDistance(distance);
            const formattedDuration = this.formatDuration(duration);

            const customerIds = [order.user_id];
            const providerIds = [order.provider_id];
            const productIds = [order.product_id];
            const address_id = [order.address_id];
            const orderIds = [order.id];

            const providers = await this.UserRequestModel.find({
                where: { id: In(providerIds) },
            });
            const setting = await this.Setting.findOne({ where: { key: "platform_charge_per_order" } });
            const customers = await this.UserRequestModel.find({
                where: { id: In(customerIds) },
            });
            const address = await this.UserLocationModel.find({
                where: { id: In(address_id) },
            });
            const customersrating = await this.RatingModel.find({
                where: { order_id: In(orderIds), customer_id: In(customerIds), provider_id: IsNull() },
            });
            const providersrating = await this.RatingModel.find({
                where: { order_id: In(orderIds), provider_id: In(providerIds), customer_id: IsNull() },
            });
            const productDetails = await this.ProductModel.find({
                where: { id: In(productIds) },
            });
            const productRequests = await this.ProductRequestModel.find({
                where: {
                    user_id: In(providerIds),
                    product_id: In(productIds),
                },
            });

            const provider = providers.find((p) => p.id === order.provider_id);
            const customer = customers.find((p) => p.id === order.user_id);
            const product = productDetails.find((p) => p.id === order.product_id);
            const addressDetails = address.find((p) => p.id === order.address_id);
            const customerRating = customersrating.find((p) => p.order_id === order.id);
            const ProviderRating = providersrating.find((p) => p.order_id === order.id);
            const productRequest = productRequests.find(
                (pr) => pr.user_id === order.provider_id && pr.product_id === order.product_id
            );

            return {
                status: true,
                message: "Order has been retrieved successfully!",
                data: {
                    ...order,
                    customerDetails: customer || null,
                    providerDetails: provider || null,
                    productDetails: product || null,
                    productChargeDetails: productRequest || null,
                    customerRating: customerRating?.rating || null,
                    ProviderRating: ProviderRating?.rating || null,
                    addressDetails: addressDetails || null,
                    platform_charge: setting.value || null,
                    // userAddress: {
                    //     latitude: userAddress.latitude,
                    //     longitude: userAddress.longitude,
                    //     address: userAddress.address,
                    // },
                    // providerAddress: {
                    //     latitude: providerAddress.latitude,
                    //     longitude: providerAddress.longitude,
                    //     address: providerAddress.address,
                    // },
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
            throw new Error(error.message);
        }
    }



    async getcstOrderListById(page: number = 1, pageSize: number = 10, id: number) {
        try {
            const { limit, offset } = CommonService.getPagination(page, pageSize);

            const [pages, count] = await this.OrderModel.findAndCount({
                where: { user_id: id },
                skip: offset,
                take: limit,
                order: { createdAt: 'DESC' },
            });

            const customerIds = pages.map((order) => order.user_id);
            const orderIds = pages.map((order) => order.id);
            const providerIds = pages.map((order) => order.provider_id);
            const productIds = pages.map((order) => order.product_id);
            const address_id = pages.map((order) => order.address_id);

            const providers = await this.UserRequestModel.find({
                where: { id: In(providerIds) },
            });
            const customers = await this.UserRequestModel.find({
                where: { id: In(customerIds) },
            });
            const address = await this.UserLocationModel.find({
                where: { id: In(address_id) },
            });
            const customersrating = await this.RatingModel.find({
                where: { order_id: In(orderIds), customer_id: In(customerIds), provider_id: IsNull() },
            });

            const providersrating = await this.RatingModel.find({
                where: { order_id: In(orderIds), provider_id: In(providerIds), customer_id: IsNull() },
            });
            const productDetails = await this.ProductModel.find({
                where: { id: In(productIds) },
            });
            const productRequests = await this.ProductRequestModel.find({
                where: {
                    user_id: In(providerIds),
                    product_id: In(productIds),
                },
            });

            const paginatedData = CommonService.getPagingData(
                { count, rows: pages },
                page,
                limit
            );

            const orderWithProviderData = paginatedData.data
                .map((order) => {
                    const provider = providers.find((p) => p.id === order.provider_id);
                    const customer = customers.find((p) => p.id === order.user_id);
                    const product = productDetails.find((p) => p.id === order.product_id);
                    const addressDetails = address.find((p) => p.id === order.address_id);
                    const customerRating = customersrating.find((p) => p.order_id === order.id);
                    const ProviderRating = providersrating.find((p) => p.order_id === order.id);
                    const productRequest = productRequests.find(
                        (pr) => pr.user_id === order.provider_id && pr.product_id === order.product_id
                    );

                    return {
                        ...order,
                        customerDetails: customer || null,
                        providerDetails: provider || null,
                        productDetails: product || null,
                        productChargeDetails: productRequest || null,
                        customerRating: customerRating?.rating || null,
                        ProviderRating: ProviderRating?.rating || null,
                        addressDetails: addressDetails || null
                    };
                })


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


    async bulkDeletedata(ids: number[]): Promise<number> {
        try {
            const categories = await this.OrderModel.find({ where: { id: In(ids) } });

            if (categories.length === 0) {
                throw new Error(CommonMessages.notFound('order'));
            }

            const result = await this.OrderModel.softDelete(ids);

            return result.affected || 0;
        } catch (error) {
            throw new Error(error.message);
        }
    }


}
