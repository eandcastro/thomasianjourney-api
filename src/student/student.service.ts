import { Injectable } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Student } from './entities/student.entity';
import { EntityRepository } from '@mikro-orm/core';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: EntityRepository<Student>,
  ) {}

  async create(createStudentDto: CreateStudentDto) {
    const newStudent = new Student();

    // newStudent.id = 1;
    newStudent.student_name = createStudentDto.student_name;
    newStudent.student_email = createStudentDto.student_email;
    newStudent.student_college_name = createStudentDto.student_college_name;
    newStudent.student_year_level = createStudentDto.student_year_level;
    newStudent.student_mobile_number = createStudentDto.student_mobile_number;
    newStudent.student_accumulated_points =
      createStudentDto.student_accumulated_points;

    await this.studentRepository.upsert(newStudent);

    return 'This action adds a new student';
  }

  findAll() {
    return `This action returns all student`;
  }

  findOne(id: number) {
    return `This action returns a #${id} student`;
  }

  update(id: number, updateStudentDto: UpdateStudentDto) {
    return `This action updates a #${id} student`;
  }

  remove(id: number) {
    return `This action removes a #${id} student`;
  }
}
