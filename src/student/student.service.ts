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

    newStudent.studentName = 'abc';
    newStudent.id = 1;
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
