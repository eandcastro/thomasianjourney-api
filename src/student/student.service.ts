import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { validate as uuidValidate, version as uuidVersion } from 'uuid';
import bcrypt from 'bcrypt';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './entities/student.entity';
import { FilterQuery, wrap } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { LoginStudentDto } from './dto/login-student.dto';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from './student.types';
import { EmailService } from '../email/email.service';
import { LoginConfirmStudentDto } from './dto/login-confirm-student.dto';

@Injectable()
export class StudentService {
  private readonly logger = new Logger(StudentService.name);
  constructor(
    // @InjectRepository(Student)
    // private readonly studentRepository: EntityRepository<Student>,
    private readonly em: EntityManager,
    private readonly jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async create(createStudentDto: CreateStudentDto) {
    const newStudent = new Student();

    const date = new Date();
    const unixTimeStamp = Math.floor(date.getTime() / 1000);

    newStudent.student_name = createStudentDto.student_name;
    newStudent.student_email = createStudentDto.student_email;
    newStudent.student_college_name = createStudentDto.student_college_name;
    newStudent.student_year_level = createStudentDto.student_year_level;
    newStudent.student_mobile_number = createStudentDto.student_mobile_number;
    newStudent.student_accumulated_points =
      createStudentDto.student_accumulated_points;
    newStudent.role = 'student';
    newStudent.fcm_token = `FCMTOKEN-${unixTimeStamp}`;
    this.logger.log(`Creating new student: ${JSON.stringify(newStudent)}`);

    const createStudent = this.em.create(Student, newStudent);
    const student = await this.em.upsert(createStudent);
    await this.em.flush();

    return student;
  }

  async login(loginStudentDto: LoginStudentDto) {
    const existingStudent = await this.em.findOne(
      Student,
      { student_email: loginStudentDto.email },
      { filters: ['active'] },
    );

    if (!existingStudent) {
      throw new BadRequestException('Student does not exists', {
        cause: new Error(),
        description: 'Student does not exists',
      });
    }

    // Generating otp for student
    const otp = await this.generateOtp();

    // Generating hashed otp for student
    const hashedOtp = await bcrypt.hash(otp, 15);

    // Send email otp
    await this.emailService.sendOtp(
      existingStudent.student_email,
      existingStudent.otp,
    );

    existingStudent.otp = hashedOtp;
    await this.em.flush();

    // TODO: remove otp once email is sending the otp correctly
    return {
      otp,
      fcm_token: existingStudent.fcm_token,
    };
  }

  async loginConfirm(loginConfirmStudentDto: LoginConfirmStudentDto) {
    const existingStudent = await this.em.findOne(
      Student,
      { student_email: loginConfirmStudentDto.email },
      { filters: ['active'] },
    );

    if (!existingStudent) {
      throw new BadRequestException('Student does not exists', {
        cause: new Error(),
        description: 'Student does not exists',
      });
    }

    const isOtpMatching = await bcrypt.compare(
      loginConfirmStudentDto.otp.toString(),
      existingStudent.otp,
    );

    if (!isOtpMatching) {
      throw new BadRequestException('OTP is incorrect', {
        cause: new Error(),
        description: 'OTP is incorrect',
      });
    }

    const cookie = this.getCookieWithJwtToken(
      existingStudent.id,
      existingStudent.role,
      existingStudent.fcm_token,
    );

    existingStudent.fcm_token = loginConfirmStudentDto.fcm_token;
    await this.em.flush();

    return cookie;
  }

  async findAll(where: FilterQuery<Student> = {}) {
    const students = await this.em.find(Student, where, {});
    return students;
  }

  async findOne(id: string, where: FilterQuery<Student> = {}) {
    if (!uuidValidate(id) || uuidVersion(id) !== 4) {
      throw new BadRequestException('Invalid student ID', {
        cause: new Error(),
        description: 'Student ID is not a v4 uuid',
      });
    }

    this.logger.log(`Finding Student ID: ${id}`);

    const existingStudent = await this.em.findOne(
      Student,
      Object.assign({}, where, { id }),
      { filters: ['active'] },
    );

    if (!existingStudent) {
      throw new BadRequestException('Student ID does not exists', {
        cause: new Error(),
        description: 'Student ID does not exists',
      });
    }

    return existingStudent;
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    if (!uuidValidate(id) || uuidVersion(id) !== 4) {
      throw new BadRequestException('Invalid student ID', {
        cause: new Error(),
        description: 'Student ID is not a v4 uuid',
      });
    }

    this.logger.log(`Updating Student ID: ${id}`);

    const existingStudent = await this.em.findOne(Student, { id }, {});

    if (!existingStudent) {
      throw new BadRequestException('Student ID does not exists', {
        cause: new Error(),
        description: 'Student ID does not exists',
      });
    }

    wrap(existingStudent).assign(updateStudentDto);
    await this.em.persistAndFlush(existingStudent);

    return existingStudent;
  }

  remove(id: string) {
    return this.em.remove(this.em.getReference(Student, id)).flush();
  }

  async generateOtp() {
    const digits = '0123456789';

    const otpLength = 6;

    let otp: number | string = '';

    for (let i = 1; i <= otpLength; i++) {
      const index = Math.floor(Math.random() * digits.length);

      otp = otp + digits[index];
    }

    return otp;
  }

  async getCookieWithJwtToken(
    student_id: string,
    role: string,
    fcm_token: string,
  ) {
    const payload: TokenPayload = { id: student_id, role, fcm_token };
    const token = this.jwtService.sign(payload);

    // TODO: return token in response headers instead of response body
    // return `Authentication=${token}; HttpOnly; Path=/;`;

    return {
      access_token: token,
    };
  }
}
