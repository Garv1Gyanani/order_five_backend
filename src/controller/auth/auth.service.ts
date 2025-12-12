import { Injectable, ConflictException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../schema/user.schema';
import * as bcrypt from 'bcryptjs';
import { AuthService } from 'src/authGuard/jwt.guard';
import { Otp } from 'src/schema/otp.schema';
import CommonService from 'src/common/common.util';
import { OptionsMessage } from 'src/common/options';
import { CommonMessages } from 'src/common/common-messages';
import { Setting } from 'src/schema/setting.schema';
import { EmailTemplate } from 'src/schema/email_templates.schema';
import * as moment from 'moment-timezone';

@Injectable()
export class LoginService {
  constructor(
    @InjectRepository(User)
    private readonly UserModel: Repository<User>,
    @InjectRepository(Otp)
    private readonly OtpModel: Repository<Otp>,
    @InjectRepository(EmailTemplate)
    private readonly EmailTemplateModel: Repository<EmailTemplate>,
    @InjectRepository(Setting)
    private readonly settingModel: Repository<Setting>,
    private readonly authService: AuthService,

  ) { }

  // ================= ADMIN LOGIN =================
  async Adminlogin(email: any, password: any) {
    const user = await this.UserModel.findOne({ where: { email } });

    if (!user) {
      return { status: false, message: 'Invalid email or password', };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        status: false,
        message: 'Invalid email or password',
      };
    }

    const token = await this.authService.generateToken({ id: user.id, name: user.name, email: user.email, user_role: user.user_role });

    return {
      status: true,
      message: 'Login successful',
      accessToken: token,
    };
  }

  // ================= PROVIDER LOGIN (OTP - KEPT AS IS) =================
  async providerregister(phone_num: any, name: any, dialing_code: any) {
    try {
      const existingUser = await this.UserModel.findOne({ where: { phone_num } });

      if (existingUser) {
        return { status: false, message: 'Phone number already exists', };
      }

      const otp = CommonService.generateOTP();
      const expires_at = new Date();
      expires_at.setMinutes(expires_at.getMinutes() + 5);

      const otpData: any = { phone_num, dialing_code, otp_code: otp, expires_at, createdAt: moment.tz('Asia/Riyadh').format('YYYY-MM-DD HH:mm:ss') };
      await this.OtpModel.save(otpData);
      await CommonService.sendOTP(phone_num, otp);

      return { status: true, message: CommonMessages.SEND_OTP('phone number'), };
    } catch (error) {
      return { status: false, message: error.message, };
    }
  }

  async providerregisterverify(phone_num: any, otp: any, dialing_code: any, name: any) {
    try {
      const otpRecord = await this.OtpModel.findOne({ where: { dialing_code, phone_num, otp_code: otp }, order: { createdAt: 'DESC' }, });
      if (!otpRecord) {
        return { status: false, message: 'Invalid OTP', };
      }

      if (new Date() > otpRecord.expires_at) {
        return { status: false, message: 'OTP has expired', };
      }

      let user = await this.UserModel.findOne({ where: { dialing_code, phone_num } });
      if (!user) {
        user = await this.UserModel.save({ phone_num, name, dialing_code, status: OptionsMessage.PROVIDER_STATUS.Pending, user_role: OptionsMessage.USER_ROLE.PROVIDER, createdAt: moment.tz('Asia/Riyadh').format('YYYY-MM-DD HH:mm:ss') });
      }
      await this.OtpModel.delete({ dialing_code, phone_num, otp_code: otp });

      const token = await this.authService.generateToken({ id: user.id, name: user.name, phone_num: user.phone_num, user_role: user.user_role, });

      // send mail to admin
      const adminuser = await this.UserModel.findOne({ where: { user_role: OptionsMessage.USER_ROLE.ADMIN } });
      if (adminuser) {
        let smtpSettings = await this.settingModel.find();
        smtpSettings = JSON.parse(JSON.stringify(smtpSettings))
        let template = await this.EmailTemplateModel.findOne({ where: { key: OptionsMessage.EMAIL_TEMPLATE.provider_register } });
        template = JSON.parse(JSON.stringify(template))

        let email_data: any = { AdminName: adminuser.name, Username: user.name, Phone_num: user.phone_num }
        await CommonService.sendEmail(adminuser.email, email_data, template, smtpSettings,);
      }

      return { status: true, message: CommonMessages.VERIFIED_OTP_SUCCESS, token, provider_profile: user.provider_profile };
    } catch (error) {
      return { status: false, message: error.message }
    }
  }

  async Providerlogin(phone_num: any, dialing_code: any) {
    const existingUser = await this.UserModel.findOne({
      where: { phone_num, user_role: OptionsMessage.USER_ROLE.PROVIDER }
    });

    if (!existingUser) {
      return { status: false, message: CommonMessages.notFound('Provider') };
    }

    if (!existingUser.is_active) {
      return { status: false, message: CommonMessages.user_inactive };
    }

    if (existingUser.is_block) {
      if (existingUser.is_pr_block) {
        return { status: false, message: CommonMessages.user_block };
      }
      const currentDate = new Date();

      if (existingUser.block_date && existingUser.block_date > currentDate) {
        return { status: false, message: CommonMessages.user_block };
      }

      if (existingUser.block_date && existingUser.block_date <= currentDate) {
        existingUser.is_block = false;
        await this.UserModel.save(existingUser);
      }
    }

    const otp = CommonService.generateOTP();
    const expires_at = new Date();
    expires_at.setMinutes(expires_at.getMinutes() + 5);

    const otpData: any = { phone_num, dialing_code, otp_code: otp, expires_at };
    await this.OtpModel.save(otpData);
    await CommonService.sendOTP(phone_num, otp);

    return { status: true, message: CommonMessages.SEND_OTP('phone number') };
  }

  async ProviderverifyOTP(phone_num: any, otp: any, dialing_code: any, device_token: any) {
    try {
      const otpRecord = await this.OtpModel.findOne({ where: { dialing_code, phone_num, otp_code: otp }, order: { createdAt: 'DESC' }, });
      if (!otpRecord) {
        return { status: false, message: 'Invalid OTP', };
      }

      if (new Date() > otpRecord.expires_at) {
        return { status: false, message: 'OTP has expired', };
      }

      let user = await this.UserModel.findOne({ where: { phone_num, user_role: OptionsMessage.USER_ROLE.PROVIDER } });
      if (!user) {
        return { status: false, message: CommonMessages.notFound('Provider') };
      }
      user.device_token = device_token;
      await this.UserModel.update({ id: user.id }, { device_token });

      await this.OtpModel.delete({ phone_num, otp_code: otp });

      const token = await this.authService.generateToken({ id: user.id, name: user.name, phone_num: user.phone_num, user_role: user.user_role });

      return { status: true, message: CommonMessages.VERIFIED_OTP_SUCCESS, token, provider_profile: user.provider_profile };
    } catch (error) {
      return { status: false, message: error.message }
    }
  }


  // ================= CUSTOMER LOGIN (CONVERTED TO EMAIL & PASSWORD) =================

  /**
   * Consolidated Customer Register
   * Expects: name, email, password, phone_num, dialing_code in body
   */
  async customerRegister(body: any) {
    try {
      const { name, email, password, phone_num, dialing_code } = body;

      // Check Email
      const existingUser = await this.UserModel.findOne({ where: { email } });
      if (existingUser) {
        return { status: false, message: 'Email already exists' };
      }

      // Check Phone (Optional but recommended)
      if (phone_num) {
        const existingPhone = await this.UserModel.findOne({ where: { phone_num } });
        if (existingPhone) {
          return { status: false, message: 'Phone number already exists' };
        }
      }

      // Hash Password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Save User
      const user = await this.UserModel.save({
        name,
        email,
        password: hashedPassword,
        phone_num,
        dialing_code,
        user_role: OptionsMessage.USER_ROLE.CUSTOMER,
        is_active: true, // Auto-activate or set to false if you need email verification
        createdAt: moment.tz('Asia/Riyadh').format('YYYY-MM-DD HH:mm:ss')
      });

      // Generate Token
      const token = await this.authService.generateToken({
        id: user.id,
        name: user.name,
        email: user.email,
        user_role: user.user_role
      });

      return { status: true, message: 'Registration successful', token };
    } catch (error) {
      return { status: false, message: error.message };
    }
  }

  /**
   * Consolidated Customer Login
   * Expects: email, password, device_token
   */
  async customerLogin(email: string, password: string, device_token: any) {
    try {
      // Find User
      let user = await this.UserModel.findOne({
        where: { email, user_role: OptionsMessage.USER_ROLE.CUSTOMER }
      });

      if (!user) {
        return { status: false, message: CommonMessages.notFound('customer') };
      }

      // Verify Password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return { status: false, message: 'Invalid email or password' };
      }

      // Check Active Status
      if (!user.is_active) {
        return { status: false, message: CommonMessages.user_inactive };
      }

      // Check Blocking Logic
      if (user.is_block) {
        if (user.is_pr_block) {
          return { status: false, message: CommonMessages.user_block };
        }

        const currentDate = new Date();

        if (user.block_date && user.block_date > currentDate) {
          return { status: false, message: CommonMessages.user_block };
        }

        // Auto-unblock if time passed
        if (user.block_date && user.block_date <= currentDate) {
          user.is_block = false;
          user.block_date = null;
          await this.UserModel.save(user);
        }
      }

      // Update Device Token
      if (device_token) {
        user.device_token = device_token;
        await this.UserModel.update({ id: user.id }, { device_token });
      }

      // Generate Token
      const token = await this.authService.generateToken({
        id: user.id,
        name: user.name,
        email: user.email,
        user_role: user.user_role
      });

      return {
        status: true,
        message: 'Login successful',
        token,
        user_details: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone_num: user.phone_num
        }
      };

    } catch (error) {
      return { status: false, message: error.message }
    }
  }


  // ================= PASSWORD RESET (COMMON) =================
  async forgetPassword(email: any) {
    const user = await this.UserModel.findOne({ where: { email: email } });

    if (!user) {
      return {
        status: 404,
        success: false,
        message: 'User not found',
      };
    }

    const resetPasswordToken = await this.authService.generateToken({ id: user.id, name: user.name, email: user.email, user_role: user.user_role });

    user.reset_password_token = resetPasswordToken;
    await this.UserModel.save(user);

    const frontendBaseUrl = 'https://order5.secretdemo.in';
    const resetPasswordLink = `${frontendBaseUrl}/reset-password?${resetPasswordToken}`;

    let smtpSettings = await this.settingModel.find();
    smtpSettings = JSON.parse(JSON.stringify(smtpSettings))

    try {
      const template = {
        subject: "Reset Your Password",
        value: `
            <p>Hello,</p>
            <p>We received a request to reset the password for your account.</p>
            <p>Please click the link below to reset your password:</p>
            <p><a href="{{ResetPasswordLink}}">Reset Password</a></p>
            <p>If you did not request this, please ignore this email.</p>
            <p>Thank you.</p>
        `,
      };

      await CommonService.sendEmail(email, { ResetPasswordLink: resetPasswordLink }, template, smtpSettings);
      return {
        status: 200,
        success: true,
        message: 'Reset password link sent to your email',
      };
    } catch (error) {
      console.log(error)
      return {
        status: 500,
        success: false,
        message: 'Failed to send reset password email',
      };
    }
  }

  async resetPassword(body: any) {
    let user = await this.UserModel.findOne({ where: { reset_password_token: body.token } });

    if (!user) {
      return {
        status: 404,
        success: false,
        message: 'Invalid or expired reset token',
      };
    }

    if (body.password !== body.confirm_password) {
      return {
        status: 400,
        success: false,
        message: 'New password and confirm password do not match',
      };
    }

    user.password = await bcrypt.hash(body.password, 10);
    user.reset_password_token = null;

    await this.UserModel.save(user);

    return {
      status: 200,
      success: true,
      message: 'Password reset successful',
    };
  }

}