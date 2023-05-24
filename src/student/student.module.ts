import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Student } from './entities/student.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Student])],
  controllers: [StudentController],
  providers: [StudentService],
})
export class StudentModule {}
