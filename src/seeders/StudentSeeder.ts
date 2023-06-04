import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Student } from '../student/entities/student.entity';

export class StudentSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const randomString = await this.generateRandomString();
    const randomNumber = await this.generateRandomNumber();
    em.create(Student, {
      student_name: 'Ean Student',
      student_email: `${randomString}@gmail.com`,
      student_college_name: 'CICS',
      student_year_level: 1,
      student_mobile_number: `09${randomNumber}`,
      student_accumulated_points: 1,
      role: 'student',
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

  async generateRandomNumber() {
    const characters = '0123456789';

    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < 10; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }
}
