import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UserService } from '../user/user.service';
import { TokenPayload } from '../user/user.types';
import { JwtService } from '@nestjs/jwt';
import { StudentService } from '../student/student.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private userService: UserService,
    private studentService: StudentService,
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
        return this.userService.findOne(payload.id, {
          role: payload.role,
        });
      case 'superadmin':
        return this.userService.findOne(payload.id, {
          role: payload.role,
        });
      case 'student':
        return this.studentService.findOne(payload.id, {
          role: payload.role,
          fcm_token: payload.fcm_token,
        });
      default:
        return null;
    }
  }
}
