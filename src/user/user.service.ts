import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { validate as uuidValidate, version as uuidVersion } from 'uuid';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EntityManager } from '@mikro-orm/postgresql';
import { User } from './entities/user.entity';
import { FilterQuery, wrap } from '@mikro-orm/core';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from './user.types';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    // @InjectRepository(User)
    // private readonly userRepository: EntityRepository<User>, // private readonly orm: MikroORM,
    private readonly em: EntityManager,
    private readonly jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const newUser = new User();

    // Generating hashed password for user
    const hashedPassword = await bcrypt.hash(createUserDto.password, 15);

    newUser.first_name = createUserDto.first_name;
    newUser.last_name = createUserDto.last_name;
    newUser.email = createUserDto.email;
    newUser.username = createUserDto.username;
    newUser.password = hashedPassword;
    newUser.role = createUserDto.role;
    newUser.office = createUserDto.office;
    newUser.contact_person_first_name = createUserDto.contact_person_first_name;
    newUser.contact_person_last_name = createUserDto.contact_person_last_name;

    this.logger.log(`Creating new user: ${JSON.stringify(newUser)}`);
    try {
      const createUser = this.em.create(User, newUser);
      const user = await this.em.upsert(createUser);
      await this.em.flush();

      return user;
    } catch (error) {
      throw new BadRequestException(
        error?.detail || 'Something went wrong with saving user',
        {
          cause: new Error(),
          description: error?.detail || 'Something went wrong with saving user',
        },
      );
    }
  }

  // TODO: add where query here
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findAll(where: FilterQuery<User> = {}, filters: string[] = ['active']) {
    const users = await this.em.find(User, {}, { filters });

    this.logger.log(`Getting all users: ${JSON.stringify(users)}`);
    return users;
  }

  async findOne(
    id: string,
    where: FilterQuery<User> = {},
    filters: string[] = ['active'],
  ) {
    if (!uuidValidate(id) || uuidVersion(id) !== 4) {
      throw new BadRequestException('Invalid User ID', {
        cause: new Error(),
        description: 'User ID is not a v4 uuid',
      });
    }

    this.logger.log(`Finding User ID: ${id}`);

    const existingUser = await this.em.findOne(
      User,
      Object.assign({}, where, { id }),
      { filters },
    );

    if (!existingUser) {
      throw new BadRequestException('User ID does not exists', {
        cause: new Error(),
        description: 'User ID does not exists',
      });
    }

    return existingUser;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (!uuidValidate(id) || uuidVersion(id) !== 4) {
      throw new BadRequestException('Invalid student ID', {
        cause: new Error(),
        description: 'Student ID is not a v4 uuid',
      });
    }

    this.logger.log(`Finding User ID: ${id}`);

    const existingUser = await this.em.findOne(
      User,
      { id },
      { filters: ['active'] },
    );

    if (!existingUser) {
      throw new BadRequestException('User ID does not exists', {
        cause: new Error(),
        description: 'User ID does not exists',
      });
    }

    wrap(existingUser).assign(updateUserDto);
    await this.em.persistAndFlush(existingUser);

    return existingUser;
  }

  async softRemove(id: string) {
    const existingUser = await this.em.findOne(
      User,
      { id },
      { filters: ['active'] },
    );

    if (!existingUser) {
      throw new BadRequestException('User ID does not exists', {
        cause: new Error(),
        description: 'User ID does not exists',
      });
    }

    existingUser.deleted_at = new Date();
    await this.em.flush();

    return existingUser;
  }

  async remove(id: string) {
    return this.em.remove(this.em.getReference(User, id)).flush();
  }

  async login(loginUserDto: LoginUserDto) {
    const existingUser = await this.em.findOne(
      User,
      { username: loginUserDto.username },
      { filters: ['active'] },
    );

    if (!existingUser) {
      throw new BadRequestException('User ID does not exists', {
        cause: new Error(),
        description: 'User ID does not exists',
      });
    }

    const isPasswordMatching = await bcrypt.compare(
      loginUserDto.password,
      existingUser.password,
    );

    if (!isPasswordMatching) {
      throw new BadRequestException('Password is incorrect', {
        cause: new Error(),
        description: 'Password is incorrect',
      });
    }

    const cookie = await this.getCookieWithJwtToken(
      existingUser.id,
      existingUser.role,
    );

    // return cookie;

    return {
      id: existingUser.id,
      role: existingUser.role,
      fcm_token: '',
      access_token: cookie.access_token,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const existingUser = await this.em.findOne(
      User,
      { username: forgotPasswordDto.username },
      { filters: ['active'] },
    );

    if (!existingUser) {
      throw new BadRequestException('User ID does not exists', {
        cause: new Error(),
        description: 'User ID does not exists',
      });
    }

    // Generate otp to be sent in email
    const otp = await this.generateOtp();

    // Save otp as temporary password
    existingUser.temporary_password = otp;
    await this.em.flush();

    // Send email for reset password
    await this.emailService.sendResetPassword(existingUser.email, otp);

    // TODO: remove this once email is working
    return { email: existingUser.email, otp };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    this.logger.log(`Resetting password ${JSON.stringify(resetPasswordDto)}`);

    const existingUser = await this.em.findOne(
      User,
      { temporary_password: resetPasswordDto.token },
      { filters: ['active'] },
    );

    if (!existingUser) {
      throw new BadRequestException('User does not exists', {
        cause: new Error(),
        description: 'User does not exists',
      });
    }

    if (resetPasswordDto.new_password !== resetPasswordDto.confirm_password) {
      throw new BadRequestException(
        'Confirm password does not match with new password',
        {
          cause: new Error(),
          description: 'Passwords do not match',
        },
      );
    }

    // Generating hash for new password of user
    const hashedPassword = await bcrypt.hash(resetPasswordDto.new_password, 15);

    existingUser.temporary_password = null;
    existingUser.password = hashedPassword;
    await this.em.flush();

    return existingUser;
  }

  async generateOtp() {
    return Math.random().toString(36).substr(2, 20);
  }

  async getCookieWithJwtToken(user_id: string, role: string) {
    const payload: TokenPayload = { id: user_id, role, fcm_token: '' };
    const token = this.jwtService.sign(payload);

    // TODO: return token in response headers instead of response body
    // return `Authentication=${token}; HttpOnly; Path=/;`;

    return {
      access_token: token,
    };
  }
}
