import { Migration } from '@mikro-orm/migrations';

export class Migration20230525143248 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "attendee" ("id" uuid not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "deleted_at" timestamptz(0) null, "student_id" uuid not null, "event_id" uuid not null, constraint "attendee_pkey" primary key ("id"));');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "attendee" cascade;');
  }

}
