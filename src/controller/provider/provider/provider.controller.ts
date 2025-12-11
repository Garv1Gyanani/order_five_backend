// src/template/template.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './provider.service';
import { CommonMessages } from 'src/common/common-messages';
import { ProviderGuard } from 'src/authGuard/provider.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('/provider')
@UseGuards(ProviderGuard)
export class UserController {
    constructor(private readonly userService: UserService) { }


    // user documents =============================
    @Get('getuserdocument/:id')
    async UserDocument(
        @Body() UserDocument: any,
        @Param('id') id: number
    ) {
        try {
            const data = await this.userService.GetUserDocument(id);
            return { status: true, message: CommonMessages.upload_data('Document'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    // Multi-upload endpoint
    @Post('multiuploaddocument')
    async MultiUploadDocument(@Req() req) {
        try {
            const user_id = req.user.id;
            const documents = req.body.documents;
            const is_resubmit = req.body.is_resubmit

            // Ensure the input is an array and has at least one document
            if (!Array.isArray(documents) || documents.length === 0) {
                return { status: false, message: 'No documents provided for upload.' };
            }

            const data = await this.userService.createMultiUserDocument(documents, is_resubmit, user_id);

            return { status: true, message: CommonMessages.upload_data('Document'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }


    @Post('uploaddocument')
    async uploaddocument(@Body() UserDocument: any) {
        try {
            const data = await this.userService.createUserDocument(UserDocument);
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
            const data = await this.userService.UpdateUserDocument(id, UserDocument);
            return { status: true, message: CommonMessages.upload_data('Document'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    // get profile =============================
    @Get('profile')
    async getUserProfile(@Req() req: any) {
        try {
            const user_id = req.user.id;
            const data = await this.userService.getUserData(user_id);
            return { status: true, message: CommonMessages.GET_DATA('Profile'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    // update profile =============================
    @Put('/profile/update/:id')
    async updateUserProfile(@Param('id') id: number, @Body() updateData: any) {
        try {
            const data = await this.userService.updateUserData(id, updateData);
            return { status: true, message: CommonMessages.updated_data('Provider'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Put('/current-status')
    async updateUserDataStatus(@Req() req: any, @Body() updateData: any) {
        try {

            const user_id = req.user.id;

            const data = await this.userService.updateUserDataStatus(user_id, updateData);
            return { status: true, message: CommonMessages.updated_data('Provider'), data };
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

    @Post('/report-customer/create')
    async reportCustomer(@Body() createDto: any, @Req() req: any) {
        
    try {
        const user_id = req.user.id;
        createDto.user_id = user_id;
  
        const data = await this.userService.reportCustomer(createDto);
        return    data  
      } catch (error) {
        return { status: false, message: error.message };
      }
    }

    @Post('/customer-review/create')
    async reviewCustomer(@Body() createDto: any, @Req() req: any) {
        
    try {
        const user_id = req.user.id;
        createDto.user_id = user_id;
  
        const data = await this.userService.reviewCustomer(createDto);
        return { status: true, message: 'review has been updated', data };
      } catch (error) {
        return { status: false, message: error.message };
      }
    }

    @Get('notification-list')
    async getAllNotificationPages(@Req() req: any) {
        try {
            const provider = req.user.id;

            const { page, size, s } = req.query;
            const data = await this.userService.getAllNotificationPages( provider,page, size, s);
            return { status: true, message: CommonMessages.GET_LIST('notification'), data };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }
   
}
