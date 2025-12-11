// src/template/template.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { OrderService } from './order_management.service';
import { CommonMessages } from 'src/common/common-messages';
import { UserGuard } from 'src/authGuard/user.guard';
import { Order } from 'src/schema/order.schema';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminGuard } from 'src/authGuard/admin.guard';
import { User } from 'src/schema/user.schema';
import { Product } from 'src/schema/product.schema';
import { ProductRequest } from 'src/schema/product_request.schema';
import * as xlsx from 'xlsx';

@Controller('/admin/product')
@UseGuards(AdminGuard)
export class OrderController {


    constructor(
        private readonly OrderService: OrderService,
        @InjectRepository(Order)
        private readonly Order: Repository<Order>,
        @InjectRepository(User)
        private readonly UserRequestModel: Repository<User>,
        @InjectRepository(Product)
        private readonly ProductModel: Repository<Product>,
        @InjectRepository(ProductRequest)
        private readonly ProductRequestModel: Repository<ProductRequest>,

    ) { }




    @Get('order-list')
    async getOrderList(@Req() req: any) {
        try {
            const { page = 1, size = 10, s = '', status } = req.query;

            const data = await this.OrderService.getOrderList(page, size, s, status);

            return data
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Get('order-list/:id')
    async OrderListById(@Param('id') id: number, @Req() req: any) {
        try {

            const data = await this.OrderService.OrderListById(id);

            return data
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Get('provider-order-list/:id')
    async getOrderListById(@Param('id') id: number, @Req() req: any) {
        try {
            const { page = 1, size = 10, s = '' } = req.query;

            const data = await this.OrderService.getOrderListById(page, size, id);

            return data
        } catch (error) {
            return { status: false, message: error.message };
        }
    }
    @Get('customer-order-list/:id')
    async getcstOrderListById(@Param('id') id: number, @Req() req: any) {
        try {
            const { page = 1, size = 10, s = '' } = req.query;

            const data = await this.OrderService.getcstOrderListById(page, size, id);

            return data
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Put('order-cancel/:id')
    async orderCancle(@Param('id') id: number, @Body() updateData: { remark: string }) {
        try {
            const order = await this.Order.findOne({ where: { id } });

            if (!order) {
                return { status: false, message: CommonMessages.notFound('Order') };
            }

            const updateFields = {
                status: 'CANCELBYADMIN',
                remark: updateData.remark
            };

            const data = await this.OrderService.updateData(id, updateFields);

            return { status: true, message: CommonMessages.updated_data('Order'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }


    @Put('order-edit/:id')
    async orderRemark(@Param('id') id: number, @Body() updateData: { remark: string }) {
        try {
            const order = await this.Order.findOne({ where: { id } });

            if (!order) {
                return { status: false, message: CommonMessages.notFound('Order') };
            }

            const updateFields = {
                remark: updateData.remark
            };

            const data = await this.OrderService.updateData(id, updateFields);

            return { status: true, message: CommonMessages.updated_data('Order'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }


    @Put('order-accept/:id')
    async orderAccept(@Param('id') id: number, @Body() updateData: { remark: string }) {
        try {
            const order = await this.Order.findOne({ where: { id } });

            if (!order) {
                return { status: false, message: CommonMessages.notFound('Order') };
            }

            const updateFields = {
                status: 'ACCEPTED',
                remark: updateData.remark
            };

            const data = await this.OrderService.updateData(id, updateFields);

            return { status: true, message: CommonMessages.updated_data('Order'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }


    @Delete('order-remove/:id')
    async orderRemove(@Param('id') id: number) {
        try {
            const order = await this.Order.findOne({ where: { id } });
    
            if (!order) {
                return { status: false, message: CommonMessages.notFound('Order') };
            }
    
            const updateFields = { deletedAt: new Date() };
    
            const data = await this.OrderService.updateData(id, updateFields);
    
            return { status: true, message: 'order has been removed successfully', data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }
    

    @Delete('order-bulkdelete')
    async bulkDeletedata(@Body('ids') ids: number[]) {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                return { status: false, message: `Please select order for delete`, };
            }

            const deletedCount = await this.OrderService.bulkDeletedata(ids);

            return { status: true, message: `${deletedCount} order deleted successfully`, };
        } catch (error) {
            return { status: false, message: error.message, };
        }
    }

    @Patch('order-export')
    async exportOrderListToXLSX(@Req() req, @Res() res) {
        try {
            const { status } = req.query;

            let whereCondition: any = {};
            if (status) {
                whereCondition['status'] = status.toUpperCase();
            }

            const pages = await this.Order.find({
                where: whereCondition,
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

            const exportedData = pages.map((order: any) => {
                const provider = providers.find((p) => p.id === order.provider_id);
                const customer = customers.find((p) => p.id === order.user_id);
                const product = productDetails.find((p) => p.id === order.product_id);
                const productRequest = productRequests.find(
                    (pr) => pr.user_id === order.provider_id && pr.product_id === order.product_id
                );

                return {
                    "Provider Name": provider?.name || '',
                    "Order ID": order?.order_id || '',
                    "Remark": order?.remark || '',
                    "Status": order?.status || '',
                    "Distance": order?.distance || '',
                    "Product Name": product?.product_name || '',
                    "Product Price": productRequest?.product_price || '',
                    "Delivery charge": productRequest?.delievery_charge || '',
                    "Customer Name": customer?.name || '',
                    "Customer Address": customer?.address_one || '',
                    "Is Active": order?.is_active ? 'Active' : 'Inactive',
                    "Created At": new Date(order?.createdAt).toLocaleString(),
                };
            });

            const ws = xlsx.utils.json_to_sheet(exportedData);
            const wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, ws, 'Order List');

            const buffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=order_list_export.xlsx');
            res.setHeader('Content-Length', buffer.length.toString());

            return res.send(buffer);
        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    }


}

