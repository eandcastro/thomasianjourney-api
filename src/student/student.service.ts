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
import { SignupStudentDto } from './dto/signup-student.dto';
import { SignupConfirmStudentDto } from './dto/signup-confirm-student.dto';
import { AttendeesService } from '../attendees/attendees.service';

@Injectable()
export class StudentService {
  private readonly logger = new Logger(StudentService.name);
  constructor(
    // @InjectRepository(Student)
    // private readonly studentRepository: EntityRepository<Student>,
    private readonly em: EntityManager,
    private readonly jwtService: JwtService,
    private emailService: EmailService,
    private attendeeService: AttendeesService,
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

  async signUp(signupStudentDto: SignupStudentDto) {
    const newStudent = new Student();

    newStudent.student_name = signupStudentDto.student_name;
    newStudent.student_email = signupStudentDto.student_email;
    newStudent.student_college_name = signupStudentDto.student_college_name;
    newStudent.student_year_level = signupStudentDto.student_year_level;
    newStudent.student_mobile_number = signupStudentDto.student_mobile_number;
    newStudent.student_accumulated_points = 1;
    newStudent.role = 'student';
    newStudent.fcm_token = signupStudentDto.fcm_token;

    this.logger.log(`New student signup: ${JSON.stringify(newStudent)}`);

    const createStudent = this.em.create(Student, newStudent);
    const student = await this.em.upsert(createStudent);
    await this.em.flush();

    // Generating otp for student
    const otp = await this.generateOtp();

    // Generating hashed otp for student
    const hashedOtp = await bcrypt.hash(otp, 15);

    // Send email otp
    await this.emailService.sendOtp(student.student_email, student.otp);

    student.otp = hashedOtp;
    await this.em.flush();

    return { student, otp };
  }

  async signUpConfirm(signupConfirmStudentDto: SignupConfirmStudentDto) {
    const existingStudent = await this.em.findOne(
      Student,
      { student_email: signupConfirmStudentDto.email },
      { filters: ['active'] },
    );

    if (!existingStudent) {
      throw new BadRequestException('Student does not exists', {
        cause: new Error(),
        description: 'Student does not exists',
      });
    }

    const isOtpMatching = await bcrypt.compare(
      signupConfirmStudentDto.otp.toString(),
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

    existingStudent.has_sso = true;
    await this.em.flush();

    return cookie;
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
    const where: FilterQuery<Student> = loginConfirmStudentDto.is_new_sso
      ? {
          student_email: loginConfirmStudentDto.email,
        }
      : {
          student_email: loginConfirmStudentDto.email,
          fcm_token: loginConfirmStudentDto.fcm_token,
        };

    const existingStudent = await this.em.findOne(Student, where, {
      filters: ['active'],
    });

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

    if (loginConfirmStudentDto.is_new_sso) {
      if (!loginConfirmStudentDto.fcm_token) {
        throw new BadRequestException('FCM token is invalid', {
          cause: new Error(),
          description: 'FCM token is invalid',
        });
      }

      existingStudent.fcm_token = loginConfirmStudentDto.fcm_token;
      await this.em.flush();
    }

    // Creating attendee entity to assign the event/s to the student, this is to ensure attendee entity for the student when the student has not yet signed up after the event has been created
    const yearLevel = `${existingStudent.student_year_level.toString()}`;
    const eventsByAttendee = await this.em.execute(
      `SELECT * from Event WHERE ? = ANY (event_year_level_attendee) AND ? = ANY(event_college_attendee)`,
      [yearLevel, existingStudent.student_college_name],
    );

    if (eventsByAttendee.length > 0) {
      for (const eventByAttendee of eventsByAttendee) {
        await this.attendeeService.createAttendeeOnLoginConfirm(
          eventByAttendee.id,
          existingStudent.id,
        );
      }
    }

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

  async softRemove(id: string) {
    const existingStudent = await this.em.findOne(
      Student,
      { id },
      { filters: ['active'] },
    );

    if (!existingStudent) {
      throw new BadRequestException('User ID does not exists', {
        cause: new Error(),
        description: 'User ID does not exists',
      });
    }

    existingStudent.deleted_at = new Date();
    await this.em.flush();

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
