import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';

export class UserSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const hashedPassword = await bcrypt.hash('abc', 15);
    const randomString = await this.generateRandomString();

    em.create(User, {
      first_name: 'Ean Admin',
      last_name: 'De Castro',
      email: `${randomString}@gmail.com`,
      username: randomString,
      password: hashedPassword,
      role: 'admin',
      office: 'CICS',
      contact_person_first_name: 'Stephen',
      contact_person_last_name: 'Curry',
    });
  }

  async generateRandomString() {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < 5; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }
}
