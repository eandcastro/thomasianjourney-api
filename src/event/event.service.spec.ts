import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Event } from './entities/event.entity';
import { ValidationPipe } from '@nestjs/common';

describe('EventService', () => {
  let service: EventService;

  const mockEventService = {
    create: jest.fn(() => {
      return {
        message: 'success',
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<EventService>(EventService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
