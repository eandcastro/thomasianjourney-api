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

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    // @InjectRepository(User)
    // private readonly userRepository: EntityRepository<User>, // private readonly orm: MikroORM,
    private readonly em: EntityManager,
    private readonly jwtService: JwtService,
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

  async findAll(where: FilterQuery<User> = {}, filters: string[] = []) {
    const users = await this.em.find(User, where, { filters });
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

    const cookie = this.getCookieWithJwtToken(
      existingUser.id,
      existingUser.role,
    );
    return cookie;
  }

  async getCookieWithJwtToken(user_id: string, role: string) {
    const payload: TokenPayload = { user_id, role };
    const token = this.jwtService.sign(payload);

    // TODO: return token in response headers instead of response body
    // return `Authentication=${token}; HttpOnly; Path=/;`;

    return {
      access_token: token,
    };
  }
}
