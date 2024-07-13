import * as fs from 'fs';
import * as path from 'path';
import { Injectable, NotImplementedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShiftEntity, ShiftRequirements } from './shift.entity';

@Injectable()
export class ShiftService {
  constructor(
    @InjectRepository(ShiftEntity)
    private readonly shiftRepository: Repository<ShiftEntity>,
  ) { }

  async getAllShifts() {
    return this.shiftRepository.find();
  }

  async getShiftsByNurse(nurseId: string) {
    const shifts = await this.shiftRepository
      .createQueryBuilder('shift')
      .innerJoinAndSelect('shift.nurse', 'nurse')
      .where('nurse.id = :nurseId', { nurseId })
      .getMany();

    return shifts;
  }

  async getShiftsBySchedule(scheduleId: string) {
    const shifts = await this.shiftRepository
      .createQueryBuilder('shift')
      .innerJoinAndSelect('shift.schedule', 'schedule')
      .where('schedule.id = :scheduleId', { scheduleId })
      .getMany();

    return shifts;
  }

  async getShiftRequirements(): Promise<ShiftRequirements[]> {
    const filePath = path.join(process.cwd(), './src/shift/shiftRequirements.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const shiftRequirements: ShiftRequirements[] = (JSON.parse(fileContents)["shiftRequirements"]);
    return shiftRequirements;
  }
}
