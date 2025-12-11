"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_schema_1 = require("../../schema/user.schema");
const bcrypt = require("bcryptjs");
const jwt_guard_1 = require("../../authGuard/jwt.guard");
const otp_schema_1 = require("../../schema/otp.schema");
const common_util_1 = require("../../common/common.util");
const options_1 = require("../../common/options");
const common_messages_1 = require("../../common/common-messages");
const setting_schema_1 = require("../../schema/setting.schema");
const email_templates_schema_1 = require("../../schema/email_templates.schema");
const moment = require("moment-timezone");
let LoginService = class LoginService {
    constructor(UserModel, OtpModel, EmailTemplateModel, settingModel, authService) {
        this.UserModel = UserModel;
        this.OtpModel = OtpModel;
        this.EmailTemplateModel = EmailTemplateModel;
        this.settingModel = settingModel;
        this.authService = authService;
    }
    async Adminlogin(email, password) {
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
    async providerregister(phone_num, name, dialing_code) {
        try {
            const existingUser = await this.UserModel.findOne({ where: { phone_num } });
            if (existingUser) {
                return { status: false, message: 'Phone number already exists', };
            }
            const otp = common_util_1.default.generateOTP();
            const expires_at = new Date();
            expires_at.setMinutes(expires_at.getMinutes() + 5);
            const otpData = { phone_num, dialing_code, otp_code: otp, expires_at, createdAt: moment.tz('Asia/Riyadh').format('YYYY-MM-DD HH:mm:ss') };
            await this.OtpModel.save(otpData);
            await common_util_1.default.sendOTP(phone_num, otp);
            return { status: true, message: common_messages_1.CommonMessages.SEND_OTP('phone number'), };
        }
        catch (error) {
            return { status: false, message: error.message, };
        }
    }
    async providerregisterverify(phone_num, otp, dialing_code, name) {
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
                user = await this.UserModel.save({ phone_num, name, dialing_code, status: options_1.OptionsMessage.PROVIDER_STATUS.Pending, user_role: options_1.OptionsMessage.USER_ROLE.PROVIDER, createdAt: moment.tz('Asia/Riyadh').format('YYYY-MM-DD HH:mm:ss') });
            }
            await this.OtpModel.delete({ dialing_code, phone_num, otp_code: otp });
            const token = await this.authService.generateToken({ id: user.id, name: user.name, phone_num: user.phone_num, user_role: user.user_role, });
            const adminuser = await this.UserModel.findOne({ where: { user_role: options_1.OptionsMessage.USER_ROLE.ADMIN } });
            if (adminuser) {
                let smtpSettings = await this.settingModel.find();
                smtpSettings = JSON.parse(JSON.stringify(smtpSettings));
                let template = await this.EmailTemplateModel.findOne({ where: { key: options_1.OptionsMessage.EMAIL_TEMPLATE.provider_register } });
                template = JSON.parse(JSON.stringify(template));
                let email_data = { AdminName: adminuser.name, Username: user.name, Phone_num: user.phone_num };
                await common_util_1.default.sendEmail(adminuser.email, email_data, template, smtpSettings);
            }
            return { status: true, message: common_messages_1.CommonMessages.VERIFIED_OTP_SUCCESS, token, provider_profile: user.provider_profile };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async Providerlogin(phone_num, dialing_code) {
        const existingUser = await this.UserModel.findOne({
            where: { phone_num, user_role: options_1.OptionsMessage.USER_ROLE.PROVIDER }
        });
        if (!existingUser) {
            return { status: false, message: common_messages_1.CommonMessages.notFound('Provider') };
        }
        if (!existingUser.is_active) {
            return { status: false, message: common_messages_1.CommonMessages.user_inactive };
        }
        if (existingUser.is_block) {
            if (existingUser.is_pr_block) {
                return { status: false, message: common_messages_1.CommonMessages.user_block };
            }
            const currentDate = new Date();
            if (existingUser.block_date && existingUser.block_date > currentDate) {
                return { status: false, message: common_messages_1.CommonMessages.user_block };
            }
            if (existingUser.block_date && existingUser.block_date <= currentDate) {
                existingUser.is_block = false;
                await this.UserModel.save(existingUser);
                const otp = common_util_1.default.generateOTP();
                const expires_at = new Date();
                expires_at.setMinutes(expires_at.getMinutes() + 5);
                const otpData = { phone_num, dialing_code, otp_code: otp, expires_at };
                await this.OtpModel.save(otpData);
                await common_util_1.default.sendOTP(phone_num, otp);
                return { status: true, message: common_messages_1.CommonMessages.SEND_OTP('phone number') };
            }
        }
        const otp = common_util_1.default.generateOTP();
        const expires_at = new Date();
        expires_at.setMinutes(expires_at.getMinutes() + 5);
        const otpData = { phone_num, dialing_code, otp_code: otp, expires_at };
        await this.OtpModel.save(otpData);
        await common_util_1.default.sendOTP(phone_num, otp);
        return { status: true, message: common_messages_1.CommonMessages.SEND_OTP('phone number') };
    }
    async ProviderverifyOTP(phone_num, otp, dialing_code, device_token) {
        try {
            const otpRecord = await this.OtpModel.findOne({ where: { dialing_code, phone_num, otp_code: otp }, order: { createdAt: 'DESC' }, });
            if (!otpRecord) {
                return { status: false, message: 'Invalid OTP', };
            }
            if (new Date() > otpRecord.expires_at) {
                return { status: false, message: 'OTP has expired', };
            }
            let user = await this.UserModel.findOne({ where: { phone_num, user_role: options_1.OptionsMessage.USER_ROLE.PROVIDER } });
            if (!user) {
                return { status: false, message: common_messages_1.CommonMessages.notFound('Provider') };
            }
            user.device_token = device_token;
            await this.UserModel.update({ id: user.id }, { device_token });
            await this.OtpModel.delete({ phone_num, otp_code: otp });
            const token = await this.authService.generateToken({ id: user.id, name: user.name, phone_num: user.phone_num, user_role: user.user_role });
            return { status: true, message: common_messages_1.CommonMessages.VERIFIED_OTP_SUCCESS, token, provider_profile: user.provider_profile };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async Customerregister(phone_num, name, dialing_code) {
        try {
            const existingUser = await this.UserModel.findOne({ where: { dialing_code, phone_num } });
            if (existingUser) {
                return { status: false, message: 'Phone number already exists', };
            }
            const otp = common_util_1.default.generateOTP();
            const expires_at = new Date();
            expires_at.setMinutes(expires_at.getMinutes() + 5);
            const otpData = {
                dialing_code, phone_num, otp_code: otp, expires_at, createdAt: moment.tz('Asia/Riyadh').format('YYYY-MM-DD HH:mm:ss')
            };
            await this.OtpModel.save(otpData);
            await common_util_1.default.sendOTP(phone_num, otp);
            return { status: true, message: common_messages_1.CommonMessages.SEND_OTP('phone number'), };
        }
        catch (error) {
            return { status: false, message: error.message, };
        }
    }
    async Customerregisterverify(phone_num, otp, dialing_code, name) {
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
                user = await this.UserModel.save({ phone_num, name, dialing_code, user_role: options_1.OptionsMessage.USER_ROLE.CUSTOMER, createdAt: moment.tz('Asia/Riyadh').format('YYYY-MM-DD HH:mm:ss') });
            }
            await this.OtpModel.delete({ phone_num, otp_code: otp });
            const token = await this.authService.generateToken({ id: user.id, name: user.name, phone_num: user.phone_num, user_role: user.user_role });
            return { status: true, message: common_messages_1.CommonMessages.VERIFIED_OTP_SUCCESS, token, };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async login(phone_num, dialing_code) {
        try {
            let user = await this.UserModel.findOne({ where: { dialing_code, phone_num, user_role: options_1.OptionsMessage.USER_ROLE.CUSTOMER } });
            if (!user) {
                return { status: false, message: common_messages_1.CommonMessages.notFound('customer'), };
            }
            if (!user.is_active) {
                return { status: false, message: common_messages_1.CommonMessages.user_inactive, };
            }
            if (user.is_block) {
                const currentDate = new Date();
                if (user.is_pr_block) {
                    return { status: false, message: common_messages_1.CommonMessages.user_block };
                }
                if (user.block_date && user.block_date > currentDate) {
                    return { status: false, message: common_messages_1.CommonMessages.user_block };
                }
                if (user.block_date && user.block_date <= currentDate) {
                    user.is_block = false;
                    await this.UserModel.save(user);
                    const otp = common_util_1.default.generateOTP();
                    const expires_at = new Date();
                    expires_at.setMinutes(expires_at.getMinutes() + 5);
                    const otpData = { phone_num, dialing_code, otp_code: otp, expires_at };
                    await this.OtpModel.save(otpData);
                    await common_util_1.default.sendOTP(phone_num, otp);
                    return { status: true, message: common_messages_1.CommonMessages.SEND_OTP('phone number') };
                }
            }
            const otp = common_util_1.default.generateOTP();
            const expires_at = new Date();
            expires_at.setMinutes(expires_at.getMinutes() + 5);
            const otpData = { dialing_code, phone_num, otp_code: otp, expires_at, };
            await this.OtpModel.save(otpData);
            await common_util_1.default.sendOTP(phone_num, otp);
            return {
                status: true,
                message: 'OTP sent successfully!',
            };
        }
        catch (error) {
            return { status: false, message: error.message, };
        }
    }
    async verifyOTP(phone_num, otp, dialing_code, device_token) {
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
                return { status: false, message: common_messages_1.CommonMessages.notFound('Customer') };
            }
            user.device_token = device_token;
            await this.UserModel.update({ id: user.id }, { device_token });
            await this.OtpModel.delete({ phone_num, otp_code: otp });
            const token = await this.authService.generateToken({ id: user.id, name: user.name, phone_num: user.phone_num, user_role: user.user_role });
            return { status: true, message: common_messages_1.CommonMessages.VERIFIED_OTP_SUCCESS, token, };
        }
        catch (error) {
            return { status: false, message: error.message };
        }
    }
    async forgetPassword(email) {
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
        smtpSettings = JSON.parse(JSON.stringify(smtpSettings));
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
            await common_util_1.default.sendEmail(email, { ResetPasswordLink: resetPasswordLink }, template, smtpSettings);
            return {
                status: 200,
                success: true,
                message: 'Reset password link sent to your email',
            };
        }
        catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'Failed to send reset password email',
            };
        }
    }
    async resetPassword(body) {
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
};
LoginService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_schema_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(otp_schema_1.Otp)),
    __param(2, (0, typeorm_1.InjectRepository)(email_templates_schema_1.EmailTemplate)),
    __param(3, (0, typeorm_1.InjectRepository)(setting_schema_1.Setting)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_guard_1.AuthService])
], LoginService);
exports.LoginService = LoginService;
//# sourceMappingURL=auth.service.js.map