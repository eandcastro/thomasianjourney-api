import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUserDto } from './dto/query-param-dto/get-user.dto';
import { GetAllUserDto } from './dto/query-param-dto/get-all-users.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { S2SGuard } from '../auth/s2s.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @ApiHeader({
    name: 'x-tj-api-security-token',
    description: 'A custom security token to ensure the origin of the request',
  })
  @UseGuards(S2SGuard)
  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
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
