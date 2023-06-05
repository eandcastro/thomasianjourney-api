import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { LoginStudentDto } from './dto/login-student.dto';
import { LoginConfirmStudentDto } from './dto/login-confirm-student.dto';
import { Roles } from '../auth/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { SignupStudentDto } from './dto/signup-student.dto';
import { SignupConfirmStudentDto } from './dto/signup-confirm-student.dto';
import { S2SGuardStudent } from '../auth/s2s.student.guard';

@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}
  @Post()
  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentService.create(createStudentDto);
  }

  @Post('sign-up')
  @ApiHeader({
    name: 'x-student-tj-api-security-token',
    description: 'A custom security token to ensure the origin of the request',
  })
  @UseGuards(S2SGuardStudent)
  signUp(@Body() signupStudentDto: SignupStudentDto) {
    return this.studentService.signUp(signupStudentDto);
  }

  @Post('sign-up/confirm')
  @ApiHeader({
    name: 'x-student-tj-api-security-token',
    description: 'A custom security token to ensure the origin of the request',
  })
  @UseGuards(S2SGuardStudent)
  signUpConfirm(@Body() signUpConfirmStudentDto: SignupConfirmStudentDto) {
    return this.studentService.signUpConfirm(signUpConfirmStudentDto);
  }

  // This can be used for login and resend otp for now
  // TODO: Add expiration time for OTP
  @Post('login/send-otp')
  @ApiHeader({
    name: 'x-student-tj-api-security-token',
    description: 'A custom security token to ensure the origin of the request',
  })
  @UseGuards(S2SGuardStudent)
  loginSendOtp(@Body() loginStudentDto: LoginStudentDto) {
    return this.studentService.login(loginStudentDto);
  }

  @ApiHeader({
    name: 'x-student-tj-api-security-token',
    description: 'A custom security token to ensure the origin of the request',
  })
  @UseGuards(S2SGuardStudent)
  @Post('login/confirm')
  loginConfirm(@Body() loginConfirmStudentDto: LoginConfirmStudentDto) {
    return this.studentService.loginConfirm(loginConfirmStudentDto);
  }

  // TODO: Specify which endpoints are for students only
  @Get()
  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  findAll() {
    return this.studentService.findAll();
  }

  // This is for admin users to fetch student profile
  @Get('admin/:id')
  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  findOne(@Param('id') id: string) {
    return this.studentService.findOne(id);
  }

  @Get('me')
  @ApiBearerAuth()
  @Roles('student')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  getStudentProfile(@Req() req: any) {
    const { user } = req;
    return this.studentService.findOne(user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentService.update(id, updateStudentDto);
  }

  @Delete('/soft-delete/:id')
  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  softRemove(@Param('id') id: string) {
    return this.studentService.softRemove(id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  remove(@Param('id') id: string) {
    return this.studentService.remove(id);
  }
}
