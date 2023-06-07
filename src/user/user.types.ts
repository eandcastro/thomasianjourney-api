import { EntityDTO } from '@mikro-orm/core';
import { User } from './entities/user.entity';

export type UserResponse = EntityDTO<User>;

export type TokenPayload = {
  id: string;
  role: string;
  fcm_token: string;
};
