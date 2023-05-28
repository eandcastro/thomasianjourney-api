import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUserDto } from './dto/query-param-dto/get-user.dto';
import { GetAllUserDto } from './dto/query-param-dto/get-all-users.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll(@Query() query: GetAllUserDto) {
    return this.userService.findAll(
      { role: query.role, office: query.office },
      query.filters,
    );
  }

  // @Param('id') id: string
  @Get(':id')
  findOne(@Param() params: GetUserDto, @Query() query: GetAllUserDto) {
    return this.userService.findOne(params.id, {
      role: query.role,
      office: query.office,
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete('/soft-delete/:id')
  softRemove(@Param('id') id: string) {
    return this.userService.softRemove(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
