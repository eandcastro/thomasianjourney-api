import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { S2SGuard } from './s2s.guard';
import { RolesGuard } from './roles.guard';
import { StudentService } from '../student/student.service';
import { EmailService } from '../email/email.service';
import { Student } from '../student/entities/student.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([User, Student]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          // expiresIn: `${configService.get('JWT_EXPIRATION_TIME')}s`,
        },
      }),
    }),
  ],
  providers: [
    JwtStrategy,
    ConfigService,
    S2SGuard,
    UserService,
    StudentService,
    EmailService,
    RolesGuard,
  ],
  exports: [PassportModule],
})
export class AuthModule {}
