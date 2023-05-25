import { Test, TestingModule } from '@nestjs/testing';
import { StudentService } from './student.service';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Student } from './entities/student.entity';
import { Logger, ValidationPipe } from '@nestjs/common';

describe('StudentService', () => {
  let service: StudentService;

  const mockStudentService = {
    create: jest.fn(() => {
      return {
        message: 'success',
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentService,
        {
          provide: getRepositoryToken(Student),
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
      .overrideProvider(StudentService)
      .useValue(mockStudentService)
      .overridePipe(ValidationPipe)
      .useClass(new ValidationPipe())
      .compile();

    service = module.get<StudentService>(StudentService);
    // const logger: Logger = module.get<Logger>(Logger);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
