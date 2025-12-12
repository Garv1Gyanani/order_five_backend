import { Repository } from 'typeorm';
import { User } from '../../schema/user.schema';
import { AuthService } from 'src/authGuard/jwt.guard';
import { Otp } from 'src/schema/otp.schema';
import { Setting } from 'src/schema/setting.schema';
import { EmailTemplate } from 'src/schema/email_templates.schema';
export declare class LoginService {
    private readonly UserModel;
    private readonly OtpModel;
    private readonly EmailTemplateModel;
    private readonly settingModel;
    private readonly authService;
    constructor(UserModel: Repository<User>, OtpModel: Repository<Otp>, EmailTemplateModel: Repository<EmailTemplate>, settingModel: Repository<Setting>, authService: AuthService);
    Adminlogin(email: any, password: any): Promise<{
        status: boolean;
        message: string;
        accessToken?: undefined;
    } | {
        status: boolean;
        message: string;
        accessToken: string;
    }>;
    providerregister(phone_num: any, name: any, dialing_code: any): Promise<{
        status: boolean;
        message: any;
    }>;
    providerregisterverify(phone_num: any, otp: any, dialing_code: any, name: any): Promise<{
        status: boolean;
        message: string;
        token: string;
        provider_profile: boolean;
    } | {
        status: boolean;
        message: any;
        token?: undefined;
        provider_profile?: undefined;
    }>;
    Providerlogin(phone_num: any, dialing_code: any): Promise<{
        status: boolean;
        message: string;
    }>;
    ProviderverifyOTP(phone_num: any, otp: any, dialing_code: any, device_token: any): Promise<{
        status: boolean;
        message: string;
        token: string;
        provider_profile: boolean;
    } | {
        status: boolean;
        message: any;
        token?: undefined;
        provider_profile?: undefined;
    }>;
    customerRegister(body: any): Promise<{
        status: boolean;
        message: string;
        token: string;
    } | {
        status: boolean;
        message: any;
        token?: undefined;
    }>;
    customerLogin(email: string, password: string, device_token: any): Promise<{
        status: boolean;
        message: string;
        token: string;
        user_details: {
            id: number;
            name: string;
            email: string;
            phone_num: number;
        };
    } | {
        status: boolean;
        message: any;
        token?: undefined;
        user_details?: undefined;
    }>;
    forgetPassword(email: any): Promise<{
        status: number;
        success: boolean;
        message: string;
    }>;
    resetPassword(body: any): Promise<{
        status: number;
        success: boolean;
        message: string;
    }>;
}
