import { Migration } from '@mikro-orm/migrations';

export class Migration20230524161456 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "event" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "deleted_at" timestamptz(0) null, "event_name" varchar(255) not null, "event_start_date" timestamptz(0) null, "event_end_date" timestamptz(0) null, "event_description" varchar(255) not null, "event_status" varchar(255) not null, "event_image" varchar(255) not null, "event_qr" varchar(255) not null, "event_venue" varchar(255) not null, "event_lead_office" varchar(255) not null, "event_broadcast_message" varchar(255) not null, "event_college_attendee" text[] not null, "event_year_level_attendee" text[] not null, "event_student_attendee_count" varchar(255) null, "event_posted_by_user_id" varchar(255) not null, "event_category_name" varchar(255) not null, "event_points" int not null);',
    );

    this.addSql(
      'create table "student" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "deleted_at" timestamptz(0) null, "student_name" varchar(255) not null, "student_email" varchar(255) not null, "student_college_name" varchar(255) not null, "student_year_level" int not null, "student_mobile_number" varchar(255) not null, "student_accumulated_points" int not null);',
    );

    this.addSql(
      'create table "user" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "deleted_at" timestamptz(0) null, "first_name" varchar(255) not null, "last_name" varchar(255) not null, "email" varchar(255) not null, "username" varchar(255) not null, "password" varchar(255) not null, "role" text check ("role" in (\'admin\', \'superadmin\')) not null, "office" varchar(255) not null, "contact_person_first_name" varchar(255) not null, "contact_person_last_name" varchar(255) not null);',
    );
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "event" cascade;');

    this.addSql('drop table if exists "student" cascade;');

    this.addSql('drop table if exists "user" cascade;');
  }
}
