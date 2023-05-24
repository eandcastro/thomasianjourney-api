import { Migration } from '@mikro-orm/migrations';

export class Migration20230523075840 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "event" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "deleted_at" timestamptz(0) null);');

    this.addSql('create table "student" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "deleted_at" timestamptz(0) null);');

    this.addSql('create table "user" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "deleted_at" timestamptz(0) null);');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "event" cascade;');

    this.addSql('drop table if exists "student" cascade;');

    this.addSql('drop table if exists "user" cascade;');
  }

}
