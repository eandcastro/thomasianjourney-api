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
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';

@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentService.create(createStudentDto);
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
