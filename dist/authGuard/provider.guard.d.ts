import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from './jwt.guard';
import { User } from 'src/schema/user.schema';
import { Repository } from 'typeorm';
export declare class ProviderGuard implements CanActivate {
    private readonly authService;
    private readonly UserModel;
    constructor(authService: AuthService, UserModel: Repository<User>);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
