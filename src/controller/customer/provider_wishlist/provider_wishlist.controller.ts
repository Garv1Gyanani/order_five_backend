 import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
 import { CommonMessages } from 'src/common/common-messages';
import { UserGuard } from 'src/authGuard/user.guard';
import { ProductWishListService } from './provider_wishlist.service';

@Controller('/customer')
@UseGuards(UserGuard)
export class ProductWishController {
    constructor(private readonly ProductWishListService: ProductWishListService) { }

   
    @Post('/wish-provider/create')
    async createWishlist(@Body() createDto: any, @Req() req: any) {
        
    try {
        const user_id = req.user.id;
        createDto.user_id = user_id;
  
        const data = await this.ProductWishListService.createData(createDto);
        return { status: true, message: 'wishlist has been updated', data };
      } catch (error) {
        return { status: false, message: error.message };
      }
    }

    @Get('/wish-provider/list')
    async getList(@Req() req: any) {
        try {
            const user_id = req.user.id;

            const { page, size, s } = req.query;
            const data = await this.ProductWishListService.getAllPages(page, size, s ,user_id);
            return  data ;
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    @Post('/report-provider/create')
    async reportProvider(@Body() createDto: any, @Req() req: any) {
        
    try {
        const user_id = req.user.id;
        createDto.user_id = user_id;
  
        const data = await this.ProductWishListService.reportProvider(createDto);
        return  data  
      } catch (error) {
        return { status: false, message: error.message };
      }
    }


    @Post('/provider-review/create')
    async reviewProvider(@Body() createDto: any, @Req() req: any) {
        
    try {
        const user_id = req.user.id;
        createDto.user_id = user_id;
  
        const data = await this.ProductWishListService.reviewProvider(createDto);
        return { status: true, message: 'review has been updated', data };
      } catch (error) {
        return { status: false, message: error.message };
      }
    }

}