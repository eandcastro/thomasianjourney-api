import { Test, TestingModule } from '@nestjs/testing';
import { AttendeesService } from './attendees.service';
import { Logger, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Attendee } from './entities/attendee.entity';

describe('AttendeesService', () => {
  let service: AttendeesService;

  const mockAttendeeService = {
    create: jest.fn(() => {
      return {
        message: 'success',
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendeesService,
        {
          provide: getRepositoryToken(Attendee),
          useFactory: jest.fn(),
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
          },
        },
      ],
    })
      .overrideProvider(AttendeesService)
      .useValue(mockAttendeeService)
      .overridePipe(ValidationPipe)
      .useClass(new ValidationPipe())
      .compile();

    service = module.get<AttendeesService>(AttendeesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
