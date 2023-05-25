import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { ValidationPipe } from '@nestjs/common';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@mikro-orm/nestjs';

describe('UserService', () => {
  let service: UserService;

  const mockUserService = {
    create: jest.fn(() => {
      return {
        message: 'success',
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useFactory: jest.fn(),
        },
      ],
    })
      .overrideProvider(UserService)
      .useValue(mockUserService)
      .overridePipe(ValidationPipe)
      .useClass(new ValidationPipe())
      .compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
