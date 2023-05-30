import { Migration } from '@mikro-orm/migrations';

export class Migration20230530084318 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "student" ("id" uuid not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "deleted_at" timestamptz(0) null, "role" text check ("role" in (\'admin\', \'superadmin\', \'student\')) not null, "fcm_token" varchar(255) null, "student_name" varchar(255) not null, "student_email" varchar(255) not null, "otp" varchar(255) null, "student_college_name" varchar(255) not null, "student_year_level" int not null, "student_mobile_number" varchar(255) not null, "student_accumulated_points" int not null, constraint "student_pkey" primary key ("id"));');
    this.addSql('alter table "student" add constraint "student_fcm_token_unique" unique ("fcm_token");');
    this.addSql('alter table "student" add constraint "student_student_email_unique" unique ("student_email");');
    this.addSql('alter table "student" add constraint "student_student_mobile_number_unique" unique ("student_mobile_number");');

    this.addSql('create table "user" ("id" uuid not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "deleted_at" timestamptz(0) null, "role" text check ("role" in (\'admin\', \'superadmin\', \'student\')) not null, "fcm_token" varchar(255) null, "first_name" varchar(255) not null, "last_name" varchar(255) not null, "email" varchar(255) not null, "username" varchar(255) not null, "password" varchar(255) not null, "office" varchar(255) not null, "contact_person_first_name" varchar(255) not null, "contact_person_last_name" varchar(255) not null, constraint "user_pkey" primary key ("id"));');
    this.addSql('alter table "user" add constraint "user_fcm_token_unique" unique ("fcm_token");');
    this.addSql('alter table "user" add constraint "user_email_unique" unique ("email");');
    this.addSql('alter table "user" add constraint "user_username_unique" unique ("username");');

    this.addSql('create table "event" ("id" uuid not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "deleted_at" timestamptz(0) null, "event_name" varchar(255) not null, "event_start_date" timestamptz(0) null, "event_end_date" timestamptz(0) null, "event_description" varchar(255) not null, "event_status" varchar(255) not null, "event_image" varchar(255) not null, "event_qr" varchar(3000) not null, "event_venue" varchar(255) not null, "event_lead_office" varchar(255) not null, "event_broadcast_message" varchar(255) not null, "event_college_attendee" text[] not null, "event_year_level_attendee" text[] not null, "event_grouped_emails" text[] not null, "event_attendee_count" int null, "user_id" uuid not null, "event_category_name" varchar(255) not null, "event_points" int not null, constraint "event_pkey" primary key ("id"));');

    this.addSql('create table "attendee" ("id" uuid not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "deleted_at" timestamptz(0) null, "student_id" uuid not null, "event_id" uuid not null, "has_attended" varchar(255) not null default false, constraint "attendee_pkey" primary key ("id"));');

    this.addSql('alter table "event" add constraint "event_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;');

    this.addSql('alter table "attendee" add constraint "attendee_student_id_foreign" foreign key ("student_id") references "student" ("id") on update cascade;');
    this.addSql('alter table "attendee" add constraint "attendee_event_id_foreign" foreign key ("event_id") references "event" ("id") on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "attendee" drop constraint "attendee_student_id_foreign";');

    this.addSql('alter table "event" drop constraint "event_user_id_foreign";');

    this.addSql('alter table "attendee" drop constraint "attendee_event_id_foreign";');

    this.addSql('drop table if exists "student" cascade;');

    this.addSql('drop table if exists "user" cascade;');

    this.addSql('drop table if exists "event" cascade;');

    this.addSql('drop table if exists "attendee" cascade;');
  }

}
