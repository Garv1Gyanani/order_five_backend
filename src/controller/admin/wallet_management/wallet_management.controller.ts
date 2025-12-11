// src/template/template.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { WalletManagementService } from './wallet_management.service';
import { CommonMessages } from 'src/common/common-messages';
import { AdminGuard } from 'src/authGuard/admin.guard';
import { OptionsMessage } from 'src/common/options';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/schema/user.schema';
import { Repository } from 'typeorm';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { Notification } from 'src/schema/notification.schema';
dotenv.config();
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CREDENTIALS || '{}')),
    });
}
@Controller('/walletbalance')
@UseGuards(AdminGuard)
export class WalletManagementController {
    constructor(
        private readonly WalletManagementService: WalletManagementService,
        @InjectRepository(User)
        private readonly UserModel: Repository<User>,
        @InjectRepository(Notification)
        private readonly NotificationModel: Repository<Notification>,
    ) { }

    @Get('list')
    async getList(@Req() req: any) {
        try {
            const { page, size, s, status } = req.query;
            const data = await this.WalletManagementService.getAllPages(page, size, s, status);
            return { status: true, message: CommonMessages.GET_LIST("Wallet Request"), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Get('userlist/:id')
    async getUserList(@Req() req: any, @Param('id') id: number) {
        try {
            const { page, size, s, status } = req.query;
            const data = await this.WalletManagementService.getUserAllPages(id, page, size, s, status);
            return { status: true, message: CommonMessages.GET_LIST("Wallet Request"), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Get('get/:id')
    async getbyId(@Param('id') id: number) {
        try {
            const data = await this.WalletManagementService.getData(id);
            return { status: true, message: CommonMessages.GET_DATA("Wallet Request"), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Post('create')
    async createdata(@Body() createDto: any) {
        try {
            let user_response: any = await this.UserModel.findOne({ where: { id: createDto?.user_id } });
            if (!user_response) {
                return { status: false, message: CommonMessages.notFound("User") };
            }
            let wallet_balance = user_response?.wallet_balance || 0
            if (createDto.amount < 0) {
                let amount = wallet_balance - Math.abs(createDto.amount);
                if (amount < 0) {
                    return { status: false, message: "You cannot deduct an amount greater than the actual balance" };
                }
            }
            if (Number(user_response?.wallet_balance) < 1) {
                createDto.available_amount = Number(user_response?.wallet_balance) || 0
            } else {
                let walletbalance = (Number(user_response?.wallet_balance) || 0) + createDto.amount
                createDto.available_amount = walletbalance
            }
            createDto.wallet_type = OptionsMessage.WALLET_PAYMENT_TYPE.Online
            createDto.status = OptionsMessage.WALLET_STATUS.Approved
            createDto.amount_status = createDto.amount > 0 ? OptionsMessage.AMOUNT_STATUS.Credit : OptionsMessage.AMOUNT_STATUS.Debit
            console.log({ createDto })
            const data = await this.WalletManagementService.createData(createDto);
            if (createDto?.user_id) {
                let user_response: any = await this.UserModel.findOne({ where: { id: createDto?.user_id } });
                if (user_response) {
                    let wallet_balance = parseFloat(user_response?.wallet_balance || '0')
                    wallet_balance += parseFloat(createDto?.amount || '0')
                    await this.UserModel.update(createDto.user_id, { wallet_balance });
                }
            }
            return { status: true, message: CommonMessages.created_data("Wallet Request"), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Put('update/:id')
    async updatedata(@Param('id') id: number, @Body() updateData: any) {
        try {
            const data = await this.WalletManagementService.updateData(id, updateData);
            return { status: true, message: CommonMessages.updated_data("Wallet Request"), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Put('acceptwalletreq/:id')
    async AcceptWalletReq(@Param('id') id: number) {
        try {
            const wallet_req_get: any = await this.WalletManagementService.getData(id);
            if (!wallet_req_get) {
                return { status: false, message: CommonMessages.notFound("Wallet Request") };
            }

            const data = await this.WalletManagementService.updateData(id, { status: OptionsMessage.WALLET_STATUS.Approved });

            if (wallet_req_get?.user_id) {
                const user_response: any = await this.UserModel.findOne({ where: { id: wallet_req_get.user_id } });
                if (user_response) {
                    let wallet_balance = parseFloat(user_response?.wallet_balance || '0')
                    wallet_balance += parseFloat(wallet_req_get?.amount || '0')

                    await this.UserModel.update(wallet_req_get.user_id, { wallet_balance });

                    const notificationTitle = "Wallet Request Approved";
                    const notificationDescription = `Your wallet request of amount ${wallet_req_get.amount} has been approved.`;

                    const dataPayload = await this.NotificationModel.save({
                        title: notificationTitle,
                        description: notificationDescription,
                        user_id: user_response.id,
                        click_event: 'wallet',
                        createdAt: new Date(),
                    });

                    const deviceToken = user_response.device_token;
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
                            console.log('Error sending notification:', error.message || error);
                        }
                    } else {
                        console.log('No device token found for the user.');
                    }

                }

            }
            return { status: true, message: "Wallet request has been accepted successfully", data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Put('rejectwalletreq/:id')
    async RejectWalletReq(@Param('id') id: number) {
        try {
            const data = await this.WalletManagementService.updateData(id, { status: OptionsMessage.WALLET_STATUS.Rejected });
            const wallet_req_get: any = await this.WalletManagementService.getData(id);
            if (wallet_req_get?.user_id) {
                const user_response: any = await this.UserModel.findOne({ where: { id: wallet_req_get.user_id } });



                const notificationTitle = "Wallet Request Rejected";
                const notificationDescription = `Your wallet request of amount ${wallet_req_get.amount} has been rejected.`;

               const dataPayload = await this.NotificationModel.save({
                    title: notificationTitle,
                    description: notificationDescription,
                    user_id: user_response.id,
                    click_event: 'wallet',
                    createdAt: new Date(),
                });

                const deviceToken = user_response.device_token;
                console.log(deviceToken,"deviceTokendeviceToken")
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
            }
            return { status: true, message: "Wallet request has been rejected successfully", data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Delete('delete/:id')
    async deletedata(@Param('id') id: number) {
        try {
            await this.WalletManagementService.deleteData(id);
            return { status: true, message: CommonMessages.deleted_data("Wallet Request") };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Delete('bulkdelete')
    async bulkDeletedata(@Body('ids') ids: number[]) {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                return { status: false, message: `Please select wallet request for delete`, };
            }

            const deletedCount = await this.WalletManagementService.bulkDeletedata(ids);

            return { status: true, message: `${deletedCount} wallet request deleted successfully`, };
        } catch (error) {
            return { status: false, message: error.message, };
        }
    }
}
