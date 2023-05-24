import { Migration } from '@mikro-orm/migrations';

export class Migration20230523090721 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "event" add column "event_title" varchar(255) not null;');

    this.addSql('alter table "student" add column "student_name" varchar(255) not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "event" drop column "event_title";');

    this.addSql('alter table "student" drop column "student_name";');
  }

}
