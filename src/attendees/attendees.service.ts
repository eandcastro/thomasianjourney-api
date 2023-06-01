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

    const student: Student = await this.em.findOne(Student, {
      id: createAttendeeDto.student_id,
    });
    const event: Event = await this.em.findOne(Event, {
      id: createAttendeeDto.event_id,
    });

    this.logger.log(`Creating new attendee: ${JSON.stringify(newAttendee)}`);

    if (!student || !event) {
      this.logger.error(`Student or event not existing`);

      throw new BadRequestException('Student or Event does not exists', {
        cause: new Error(),
        description: 'Student/Event ID does not exists',
      });
    }

    newAttendee.student = student;
    newAttendee.event = event;
    const where: FilterQuery<Attendee> = {
      event: newAttendee.event,
      student: newAttendee.student,
    };

    const existingAttendee = await this.em.findOne(Attendee, where, {});

    if (existingAttendee) {
      throw new BadRequestException('Attendee has already been created', {
        cause: new Error(),
        description: 'Created attendee already',
      });
    }

    const createAttendee = this.em.create(Attendee, newAttendee);
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

    // TODO: check if you can query by has_attended = "false"
    const where: FilterQuery<Attendee> = {
      event,
      student,
    };

    const existingAttendee = await this.em.findOne(Attendee, where, {});
    const existingEvent = await this.em.findOne(
      Event,
      { id: event.id, event_status: 'ONGOING' },
      {},
    );

    if (existingAttendee.has_attended.toString() === 'true') {
      throw new BadRequestException('Attendee has already attended the event', {
        cause: new Error(),
        description: 'Attended already',
      });
    }

    if (!existingEvent) {
      throw new BadRequestException('Event is either upcoming or cancelled', {
        cause: new Error(),
        description: 'Event is either upcoming or cancelled',
      });
    }

    existingAttendee.has_attended = true;
    await this.em.flush();

    existingEvent.event_attendee_count = existingEvent.event_attendee_count + 1;
    await this.em.flush();

    const existingStudent = await this.em.findOne(
      Student,
      { id: student.id },
      {},
    );

    existingStudent.student_accumulated_points =
      existingStudent.student_accumulated_points + existingEvent.event_points;
    await this.em.flush();

    this.logger.log(
      `Attendee attending event: ${JSON.stringify(existingAttendee)}`,
    );

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

    const eventAttendees = await this.em.find(Attendee, where, {
      filters: ['active'],
      populate: ['event', 'student'],
    });

    const eventAttendeesCount = await this.em.findAndCount(Attendee, where, {
      filters: ['active'],
      populate: ['event', 'student'],
    });

    return { ...eventAttendees, count: eventAttendeesCount };
  }

  update(id: number) {
    return `This action updates a #${id} attendee`;
  }

  remove(id: number) {
    return `This action removes a #${id} attendee`;
  }
}
