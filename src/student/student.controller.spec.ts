import { Test, TestingModule } from '@nestjs/testing';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Student } from './entities/student.entity';
import { ValidationPipe } from '@nestjs/common';

describe('StudentController', () => {
  let controller: StudentController;

  const mockStudentService = {
    create: jest.fn(() => {
      return {
        message: 'success',
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentController],
      providers: [
        StudentService,
        {
          provide: getRepositoryToken(Student),
          useFactory: jest.fn(),
        },
      ],
    })
      .overrideProvider(StudentService)
      .useValue(mockStudentService)
      .overridePipe(ValidationPipe)
      .useClass(new ValidationPipe())
      .compile();

    controller = module.get<StudentController>(StudentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
