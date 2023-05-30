import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
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
  // TODO: Specify which endpoints require public security token
  @Post()
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentService.create(createStudentDto);
  }

  @Post('sign-up')
  @ApiHeader({
    name: 'x-tj-student-api-security-token',
    description: 'A custom security token to ensure the origin of the request',
  })
  @UseGuards(S2SGuardStudent)
  signUp(@Body() signupStudentDto: SignupStudentDto) {
    return this.studentService.signUp(signupStudentDto);
  }

  @Post('sign-up/confirm')
  signUpConfirm(@Body() signUpConfirmStudentDto: SignupConfirmStudentDto) {
    return this.studentService.signUpConfirm(signUpConfirmStudentDto);
  }

  // TODO: Add otp feature for student module
  @Post('login/send-otp')
  loginSendOtp(@Body() loginStudentDto: LoginStudentDto) {
    return this.studentService.login(loginStudentDto);
  }

  @Post('login/confirm')
  loginConfirm(@Body() loginConfirmStudentDto: LoginConfirmStudentDto) {
    return this.studentService.loginConfirm(loginConfirmStudentDto);
  }

  // TODO: Specify which endpoints are for students only
  @Get()
  @ApiBearerAuth()
  @Roles('student')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  findAll() {
    return this.studentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentService.update(id, updateStudentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentService.remove(id);
  }
}
