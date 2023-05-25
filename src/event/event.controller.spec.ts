import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { ValidationPipe } from '@nestjs/common';

describe('EventController', () => {
  let controller: EventController;

  const mockEventService = {
    create: jest.fn(() => {
      return {
        message: 'success',
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [
        EventService,
        {
          provide: getRepositoryToken(Event),
          useFactory: jest.fn(),
        },
      ],
    })
      .overrideProvider(EventService)
      .useValue(mockEventService)
      .overridePipe(ValidationPipe)
      .useClass(new ValidationPipe())
      .compile();

    controller = module.get<EventController>(EventController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create user and return him', async () => {
    expect(
      await controller.create({
        event_name: 'Paskuhan',
        event_description: 'Christmas Paskuhan',
        event_image: 'paskuhan_image.jpg',
        event_qr: 'paskuhan_qr.png',
        event_venue: 'QPAV',
        event_lead_office: 'Office of CICS',
        event_broadcast_message: 'Please attend the event.',
        event_college_attendee: ['CICS', 'SCIENCE'],
        event_year_level_attendee: [1, 2],
        event_posted_by_user_id: '1',
        event_category_name: 'school_events',
        event_points: 1,
      }),
    ).toEqual({
      message: 'success',
    });
  });
});
