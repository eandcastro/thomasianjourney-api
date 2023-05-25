import { Injectable, Logger } from '@nestjs/common';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { EntityManager } from '@mikro-orm/postgresql';
import { Attendee } from './entities/attendee.entity';

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

    newAttendee.student_id = createAttendeeDto.student_id;
    newAttendee.event_id = createAttendeeDto.event_id;

    this.logger.log(`Creating new attendee: ${JSON.stringify(newAttendee)}`);

    const createAttendee = this.em.create(Event, newAttendee);
    await this.em.upsert(createAttendee);
    await this.em.flush();

    return {
      message: 'success',
    };
  }

  findAll() {
    return `This action returns all attendees`;
  }

  findOne(id: number) {
    return `This action returns a #${id} attendee`;
  }

  update(id: number) {
    return `This action updates a #${id} attendee`;
  }

  remove(id: number) {
    return `This action removes a #${id} attendee`;
  }
}
