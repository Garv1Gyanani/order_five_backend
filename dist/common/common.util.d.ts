declare const CommonService: {
    getPagination: (page: number, size: number) => {
        limit: number;
        offset: number;
    };
    getPagingData: (alldata: {
        count: number;
        rows: any[];
    }, page: number, limit: number) => {
        totalItems: number;
        data: any[];
        totalPages: number;
        currentPage: number;
    };
    generateOTP: () => number;
    sendOTP: (phone_num: any, otp: any) => void;
    createTransactionId: () => string;
    sendEmail: (to: string, variables: Record<string, string>, template: any, smtpSettings: any) => Promise<void>;
};
export default CommonService;
