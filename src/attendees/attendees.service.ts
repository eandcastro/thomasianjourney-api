import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { EntityManager } from '@mikro-orm/postgresql';
import { Attendee } from './entities/attendee.entity';
import { Student } from '../student/entities/student.entity';
import { Event } from '../event/entities/event.entity';
import { FilterQuery } from '@mikro-orm/core';

@Injectable()
export class AttendeesService {
  private readonly logger = new Logger(AttendeesService.name);

  constructor(
    // @InjectRepository(Event)
    // private readonly eventRepository: EntityRepository<Event>, // private readonly orm: MikroORM,
    private readonly em: EntityManager,
  ) {}

  async create(createAttendeeDto: CreateAttendeeDto) {
    const newAttendee = new Attendee();

    newAttendee.student = this.em.getReference(
      Student,
      createAttendeeDto.student_id,
    );
    newAttendee.event = this.em.getReference(Event, createAttendeeDto.event_id);

    this.logger.log(`Creating new attendee: ${JSON.stringify(newAttendee)}`);

    const createAttendee = this.em.create(Event, newAttendee);
    const attendee = await this.em.upsert(createAttendee);
    await this.em.flush();

    return attendee;
  }

  async attendEvent(event_id: string, student_id: string) {
    const student = this.em.getReference(Student, student_id);
    const event = this.em.getReference(Event, event_id);

    if (!student || !event) {
      this.logger.error(
        `Attendee not existing: ${JSON.stringify({ event_id, student_id })}`,
      );

      throw new BadRequestException('Attendee or Event does not exists', {
        cause: new Error(),
        description: 'Attend/Event ID does not exists',
      });
    }

    const where: FilterQuery<Attendee> = {
      event,
      student,
    };

    const existingAttendee = await this.em.findOne(Attendee, where, {});

    this.logger.log(
      `Attendee attending event: ${JSON.stringify(existingAttendee)}`,
    );

    existingAttendee.has_attended = true;
    await this.em.flush();

    return existingAttendee;
  }

  findAll() {
    return `This action returns all attendees`;
  }

  // Find attendees by event
  async findEventAttendees(event_id: string) {
    const event = this.em.getReference(Event, event_id);

    const where: FilterQuery<Attendee> = {
      event,
    };

    const eventAttendees = await this.em.findOne(Attendee, where, {
      filters: ['active'],
      populate: ['event', 'student'],
    });

    return eventAttendees;
  }

  update(id: number) {
    return `This action updates a #${id} attendee`;
  }

  remove(id: number) {
    return `This action removes a #${id} attendee`;
  }
}
