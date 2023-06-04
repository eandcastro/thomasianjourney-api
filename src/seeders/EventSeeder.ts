import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Event } from '../event/entities/event.entity';
import { User } from '../user/entities/user.entity';

export class EventSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const user: User[] = await em.find(User, {});
    em.create(Event, {
      event_name: 'Paskuhan',
      event_venue: 'QPAV',
      event_description: 'description here',
      event_lead_office: 'Office of CICS',
      event_status: 'UPCOMING',
      event_image: 'ust.png',
      event_qr: 'ust-qr.png',
      event_broadcast_message: 'Please attend the event.',
      event_college_attendee: ['CICS', 'SCIENCE'],
      event_year_level_attendee: [1, 2],
      event_grouped_emails: ['group1@gmail.com', 'group2@gmail.com'],
      user: user[0],
      event_category_name: 'school_events',
      event_points: 1,
      event_start_date: new Date('2023-06-17T11:06:50.369Z'),
      event_end_date: new Date('2023-06-18T11:06:50.369Z'),
    });
  }
}
