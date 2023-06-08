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
  UseInterceptors,
  Req,
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
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EntityTransformInterceptor } from 'src/utils/entity_transform.interceptor';
import { User } from './entities/user.entity';
import { UserResponse } from './user.types';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiHeader({
    name: 'x-tj-api-security-token',
    description: 'A custom security token to ensure the origin of the request',
  })
  @UseGuards(S2SGuard)
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

  @ApiHeader({
    name: 'x-tj-api-security-token',
    description: 'A custom security token to ensure the origin of the request',
  })
  @UseGuards(S2SGuard)
  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.userService.forgotPassword(forgotPasswordDto);
  }

  @ApiHeader({
    name: 'x-tj-api-security-token',
    description: 'A custom security token to ensure the origin of the request',
  })
  @UseGuards(S2SGuard)
  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.userService.resetPassword(resetPasswordDto);
  }

  @Get()
  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @UseInterceptors(EntityTransformInterceptor<User, UserResponse>)
  findAll(@Query() query: GetAllUserDto) {
    return this.userService.findAll(
      { role: query.role, office: query.office },
      query.filters,
    );
  }

  @Get('/admin/:id')
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  findOne(@Param() params: GetUserDto, @Query() query: GetAllUserDto) {
    return this.userService.findOne(params.id, {
      role: query.role,
      office: query.office,
    });
  }

  // This is for admin/superadmin to get their own profile
  @Get('me')
  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  getStudentProfile(@Req() req: any) {
    const { user } = req;
    return this.userService.findOne(user.id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete('/soft-delete/:id')
  @ApiBearerAuth()
  @Roles('superadmin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  softRemove(@Param('id') id: string) {
    return this.userService.softRemove(id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('superadmin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
