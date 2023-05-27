import { Test, TestingModule } from '@nestjs/testing';
import { AttendeesController } from './attendees.controller';
import { AttendeesService } from './attendees.service';
import { ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Attendee } from './entities/attendee.entity';

describe('AttendeesController', () => {
  let controller: AttendeesController;

  const mockAttendeeService = {
    create: jest.fn(() => {
      return {
        message: 'success',
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendeesController],
      providers: [
        AttendeesService,
        {
          provide: getRepositoryToken(Attendee),
          useFactory: jest.fn(),
        },
      ],
    })
      .overrideProvider(AttendeesService)
      .useValue(mockAttendeeService)
      .overridePipe(ValidationPipe)
      .useClass(new ValidationPipe())
      .compile();

    controller = module.get<AttendeesController>(AttendeesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
