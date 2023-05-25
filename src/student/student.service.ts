import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './entities/student.entity';
import { FilterQuery, wrap } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';

@Injectable()
export class StudentService {
  private readonly logger = new Logger(StudentService.name);
  constructor(
    // @InjectRepository(Student)
    // private readonly studentRepository: EntityRepository<Student>,
    private readonly em: EntityManager,
  ) {}

  async create(createStudentDto: CreateStudentDto) {
    const newStudent = new Student();

    newStudent.student_name = createStudentDto.student_name;
    newStudent.student_email = createStudentDto.student_email;
    newStudent.student_college_name = createStudentDto.student_college_name;
    newStudent.student_year_level = createStudentDto.student_year_level;
    newStudent.student_mobile_number = createStudentDto.student_mobile_number;
    newStudent.student_accumulated_points =
      createStudentDto.student_accumulated_points;

    this.logger.log(`Creating new student: ${JSON.stringify(newStudent)}`);

    const createStudent = this.em.create(Student, newStudent);
    await this.em.upsert(createStudent);
    await this.em.flush();

    return {
      message: 'success',
    };
  }

  async findAll(where: FilterQuery<Student> = {}) {
    const students = await this.em.find(Student, where, {});
    return students;
  }

  async findOne(id: number, where: FilterQuery<Student> = {}) {
    this.logger.log(`Finding Student ID: ${id}`);

    const existingStudent = await this.em.findOne(
      Student,
      Object.assign({}, where, { id }),
      { filters: [] },
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
}
