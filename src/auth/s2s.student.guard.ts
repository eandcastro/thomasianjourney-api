import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class S2SGuardStudent implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const securityToken = request.header('x-student-tj-api-security-token');

    return (
      securityToken === this.configService.get('PUBLIC_STUDENT_SECURITY_TOKEN')
    );
  }
}
