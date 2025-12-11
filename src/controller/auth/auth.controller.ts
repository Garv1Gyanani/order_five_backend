import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { LoginService } from './auth.service';
import { AdminGuard } from 'src/authGuard/admin.guard';
import { CommonMessages } from 'src/common/common-messages';
import { ProviderGuard } from 'src/authGuard/provider.guard';
import { UserGuard } from 'src/authGuard/user.guard';

@Controller()
export class LoginController {
  constructor(private readonly LoginService: LoginService) { }


  // admin login ----------------
  @Post('admin/login')
  async AdminLogin(@Body('email') email: string, @Body('password') password: string) {
    return this.LoginService.Adminlogin(email, password);
  }

  @Post('admin/logout')
  @UseGuards(AdminGuard)
  async AdminLogout(@Req() req) {
    let user_id = req.body.id
    return { status: true, message: CommonMessages.LOGOUT_SUCCESS };
  }

  @Post('admin/forget-password')
  async forgetPassword(
      @Body('email') email: string
  ) {
      return await this.LoginService.forgetPassword(email);
  }

  
  @Post('admin/reset-password')
  async resetPassword(
      @Body() body: {
          token: string;
          password: string;
          confirm_password: string;
      }
  ) {
      return await this.LoginService.resetPassword(body);
  }



  // provider login
  @Post('provider/registersendotp')
  async providerregister(@Req() req) {
    let { phone_num, name, dialing_code } = req.body
    const response = await this.LoginService.providerregister(phone_num, name, dialing_code);
    return response;
  }

  @Post('provider/registerverifyotp')
  async providerregisterverify(@Req() req) {
    let { phone_num, otp, dialing_code, name } = req.body

    const response = await this.LoginService.providerregisterverify(phone_num, otp, dialing_code, name);
    return response;
  }

  @Post('provider/loginsendotp')
  async providerLogin(@Req() req,) {
    let { phone_num, dialing_code } = req.body
    let response = this.LoginService.Providerlogin(phone_num, dialing_code);
    return response;
  }

  @Post('provider/loginverify')
  async ProviderverifyOTP(@Body() body: { phone_num: string, otp: string, dialing_code: any ,device_token:any}) {
    return this.LoginService.ProviderverifyOTP(body.phone_num, body.otp, body.dialing_code,body.device_token);
  }

  @Post('provider/logout')
  @UseGuards(ProviderGuard)
  async ProviderLogout(@Req() req) {
    let user_id = req.body.id
    return { status: true, message: CommonMessages.LOGOUT_SUCCESS };
  }

  // customer login
  @Post('customer/registersendotp')
  async Customerregister(@Req() req) {
    let { phone_num, name, dialing_code } = req.body
    const response = await this.LoginService.Customerregister(phone_num, name, dialing_code);
    return response;
  }

  @Post('customer/registerverifyotp')
  async Customerregisterverify(@Req() req) {
    let { phone_num, otp, dialing_code, name } = req.body

    const response = await this.LoginService.Customerregisterverify(phone_num, otp, dialing_code, name);
    return response;
  }

  @Post('customer/sendotp')
  async login(@Body() body: { phone_num: string, dialing_code: any }) {
    return this.LoginService.login(body.phone_num, body.dialing_code);
  }

  // Verify OTP and generate JWT token
  @Post('customer/verify')
  async verifyOTP(@Body() body: { phone_num: string, otp: string, dialing_code: any ,device_token :any}) {
    return this.LoginService.verifyOTP(body.phone_num, body.otp, body.dialing_code , body.device_token);
  }

  @Post('customer/logout')
  @UseGuards(UserGuard)
  async CustomerLogout(@Req() req) {
    let user_id = req.body.id
    return { status: true, message: CommonMessages.LOGOUT_SUCCESS };
  }

}
