import { NotificationService } from './notification.service';
import { Notification } from 'src/schema/notification.schema';
import { Repository } from 'typeorm';
export declare class NotificationController {
    private readonly NotificationService;
    private readonly Notification;
    constructor(NotificationService: NotificationService, Notification: Repository<Notification>);
    createNotification(createDto: any): Promise<{
        status: boolean;
        message: any;
    }>;
    getList(req: any): Promise<{
        status: boolean;
        message: string;
        data: {
            totalItems: number;
            data: any[];
            totalPages: number;
            currentPage: number;
        };
    } | {
        status: boolean;
        message: any;
        data?: undefined;
    }>;
}
