import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

describe('UserController', () => {
  let controller: UserController;

  const mockUserService = {
    create: jest.fn(() => {
      return {
        message: 'success',
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService, ConfigService],
    })
      .overrideProvider(UserService)
      .useValue(mockUserService)
      .overridePipe(ValidationPipe)
      .useClass(new ValidationPipe())
      .compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
