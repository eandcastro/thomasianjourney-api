import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EntityManager } from '@mikro-orm/postgresql';
import { User } from './entities/user.entity';
import { FilterQuery, wrap } from '@mikro-orm/core';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    // @InjectRepository(User)
    // private readonly userRepository: EntityRepository<User>, // private readonly orm: MikroORM,
    private readonly em: EntityManager,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const newUser = new User();

    newUser.first_name = createUserDto.first_name;
    newUser.last_name = createUserDto.last_name;
    newUser.email = createUserDto.email;
    newUser.username = createUserDto.username;
    newUser.password = createUserDto.password;
    newUser.role = createUserDto.role;
    newUser.office = createUserDto.office;
    newUser.contact_person_first_name = createUserDto.contact_person_first_name;
    newUser.contact_person_last_name = createUserDto.contact_person_last_name;

    this.logger.log(`Creating new user: ${JSON.stringify(newUser)}`);

    const createUser = this.em.create(User, newUser);
    await this.em.upsert(createUser);
    await this.em.flush();

    return {
      message: 'success',
    };
  }

  async findAll(where: FilterQuery<User> = {}) {
    const users = await this.em.find(User, where, {});
    return users;
  }

  async findOne(id: string, where: FilterQuery<User> = {}) {
    this.logger.log(`Finding User ID: ${id}`);

    const existingUser = await this.em.findOne(
      User,
      Object.assign({}, where, { id }),
      { filters: [] },
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
    this.logger.log(`Finding User ID: ${id}`);

    const existingUser = await this.em.findOne(User, { id }, {});

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

  async remove(id: string) {
    return this.em.remove(this.em.getReference(User, id)).flush();
  }
}
