// src/guards/user.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException, } from '@nestjs/common';
import { AuthService } from './jwt.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/schema/user.schema';
import { Repository } from 'typeorm';
import { OptionsMessage } from 'src/common/options';
import { CommonMessages } from 'src/common/common-messages';
AuthService

@Injectable()
export class UserGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(User)
    private readonly UserModel: Repository<User>,
  ) { }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['x-access-token'];

    if (!token) throw new UnauthorizedException('Token not found');

    const user = await this.authService.verifyToken(token);

    let user_data = await this.UserModel.findOne({ where: { id: user.id, user_role: OptionsMessage.USER_ROLE.CUSTOMER } })

    if (!user_data) throw new UnauthorizedException({ message: CommonMessages.PERMISSION_ERR, statusCode: 401 });
    if (!user_data.is_active) { throw new UnauthorizedException({ message: CommonMessages.user_inactive, statusCode: 401 }) }
    // if (user_data.is_block) { throw new UnauthorizedException({ message: CommonMessages.user_block, statusCode: 401 }) }

    request.user = user;
    return true;
  }
}
