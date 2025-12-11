// src/template/template.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CommonMessages } from 'src/common/common-messages';
import { AdminGuard } from 'src/authGuard/admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UserGuard } from 'src/authGuard/user.guard';
import { ProviderGuard } from 'src/authGuard/provider.guard';
import { User } from 'src/schema/user.schema';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscription } from 'src/schema/subscription.schema';
import { SubscriptionOrder } from 'src/schema/subscription.orders.schema';
import { Wallet_req } from 'src/schema/wallet_req.schema';

@Controller('/user/subscription')
@UseGuards(ProviderGuard)
export class SubscriptionController {
    constructor(private readonly SubscriptionService: SubscriptionService,
        @InjectRepository(User)
        private readonly UserModel: Repository<User>,
        @InjectRepository(Subscription)
        private readonly SubscriptionModel: Repository<Subscription>,
        @InjectRepository(SubscriptionOrder)
        private readonly SubscriptionOrder: Repository<SubscriptionOrder>,
        @InjectRepository(Wallet_req)
        private readonly WalletReqModel: Repository<Wallet_req>,
    ) { }

    @Get('list')
    async getList(@Req() req: any) {
        try {
            const { page, size, s } = req.query;
            const data = await this.SubscriptionService.getAllPages(page, size, s);
            return { status: true, message: CommonMessages.GET_LIST('Subscription'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }


    @Get('get/:id')
    async getbyId(@Param('id') id: number) {
        try {
            const data = await this.SubscriptionService.getData(id);
            return { status: true, message: CommonMessages.GET_DATA('Subscription'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Post('/create-order')
    async SubCreateOrder(@Body() createDto: any, @Req() req: any) {
        try {
            const { subscription_id, amount } = createDto;
            const user_id = req.user.id;

            const subscriptionPlan = await this.SubscriptionModel.findOne({ where: { id: subscription_id } });
            if (!subscriptionPlan) {
                return { status: false, message: 'Invalid subscription plan' };
            }

            const user = await this.UserModel.findOne({ where: { id: user_id } });
            if (!user) {
                return { status: false, message: 'User not found' };
            }

            if (user.wallet_balance < amount) {
                return { status: false, message: 'Insufficient wallet balance' };
            }

            const updatedWalletBalance = user.wallet_balance - amount;

            const currentDate = new Date();
            const expiryDate = new Date();
            expiryDate.setDate(currentDate.getDate() + subscriptionPlan.duration_day);

             await this.UserModel.update(
                { id: user_id },
                {
                    wallet_balance: updatedWalletBalance,
                    subscription_id: subscription_id,
                    expiry_date: expiryDate,
                }
            );

            let SubscriptionOrder :any= await this.SubscriptionOrder.create({
                user_id: user_id,
                amount: amount,
                status:"Success",
                subscription_id,
 
            });

            SubscriptionOrder = await this.SubscriptionOrder.save(SubscriptionOrder);

            let WalletReqModel :any =await this.WalletReqModel.create({
                user_id: user_id,
                user_type: 'Provider',  
                amount_status: 'Debit',  
                wallet_type: 'Online', 
                transaction_id: `SUB-${Date.now()}`,  
                currency: 'OMR', 
                amount: amount,
                available_amount: updatedWalletBalance,
                remark: `Subscription purchased: ${subscriptionPlan.name}`,
                date: currentDate,
                order_type:"Subscription",
                status: 'Accepted', 
            })

            WalletReqModel = await this.WalletReqModel.save(WalletReqModel);


            return {
                status: true,
                message: 'Plan purchase successful',
                // data: {
                //     subscription_id: subscription_id,
                //     wallet_balance: updatedWalletBalance,
                //     expiry_date: expiryDate,
                // },
            };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Post('/cancel')
    async SubCancelOrder(@Body() createDto: any, @Req() req: any) {
        const user_id = req.user.id;
    
        try {
             const user = await this.UserModel.findOne({ where: { id: user_id } });
            if (!user) {
                return { status: false, message: 'User not found' };
            }
    
            const currentDate = new Date();
    
             if (user.expiry_date && user.expiry_date <= currentDate) {
                return { status: false, message: 'Subscription already expired' };
            }
    
             await this.UserModel.update(
                { id: user_id },
                {
                    subscription_id: null,
                    expiry_date: null,
                }
            );
    
             const cancellationOrder = await this.SubscriptionOrder.create({
                user_id: user_id,
                amount: 0,  
                status: 'Cancelled',
                subscription_id: user.subscription_id,
            });
    
            // Save the cancellation record
            await this.SubscriptionOrder.save(cancellationOrder);
    
            return {
                status: true,
                message: 'Subscription cancelled successfully',
            };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }
    



    
}
