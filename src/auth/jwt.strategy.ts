import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EntityManager } from '@mikro-orm/postgresql';

import { UserService } from '../user/user.service';
import { TokenPayload } from '../user/user.types';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);
  private readonly userService = new UserService(this.entity, this.jwtService);
  constructor(
    private readonly configService: ConfigService,
    private readonly entity: EntityManager,
    private readonly jwtService: JwtService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: TokenPayload) {
    this.logger.log(
      `Validating bearer auth with payload: ${JSON.stringify(payload)}`,
    );
    switch (payload.role) {
      case 'admin':
        return this.userService.findOne(payload.user_id, {
          role: payload.role,
        });
      case 'superadmin':
        return this.userService.findOne(payload.user_id, {
          role: payload.role,
        });
      // TODO: implement jwt service in student service
      case 'student':
        return this.userService.findOne(payload.user_id, {
          role: payload.role,
        });
      default:
        return null;
    }
  }
}
