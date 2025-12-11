import { LoginService } from './auth.service';
export declare class LoginController {
    private readonly LoginService;
    constructor(LoginService: LoginService);
    AdminLogin(email: string, password: string): Promise<{
        status: boolean;
        message: string;
        accessToken?: undefined;
    } | {
        status: boolean;
        message: string;
        accessToken: string;
    }>;
    AdminLogout(req: any): Promise<{
        status: boolean;
        message: string;
    }>;
    forgetPassword(email: string): Promise<{
        status: number;
        success: boolean;
        message: string;
    }>;
    resetPassword(body: {
        token: string;
        password: string;
        confirm_password: string;
    }): Promise<{
        status: number;
        success: boolean;
        message: string;
    }>;
    providerregister(req: any): Promise<{
        status: boolean;
        message: any;
    }>;
    providerregisterverify(req: any): Promise<{
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
    providerLogin(req: any): Promise<{
        status: boolean;
        message: string;
    }>;
    ProviderverifyOTP(body: {
        phone_num: string;
        otp: string;
        dialing_code: any;
        device_token: any;
    }): Promise<{
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
    ProviderLogout(req: any): Promise<{
        status: boolean;
        message: string;
    }>;
    Customerregister(req: any): Promise<{
        status: boolean;
        message: any;
    }>;
    Customerregisterverify(req: any): Promise<{
        status: boolean;
        message: string;
        token: string;
    } | {
        status: boolean;
        message: any;
        token?: undefined;
    }>;
    login(body: {
        phone_num: string;
        dialing_code: any;
    }): Promise<{
        status: boolean;
        message: any;
    }>;
    verifyOTP(body: {
        phone_num: string;
        otp: string;
        dialing_code: any;
        device_token: any;
    }): Promise<{
        status: boolean;
        message: string;
        token: string;
    } | {
        status: boolean;
        message: any;
        token?: undefined;
    }>;
    CustomerLogout(req: any): Promise<{
        status: boolean;
        message: string;
    }>;
}
