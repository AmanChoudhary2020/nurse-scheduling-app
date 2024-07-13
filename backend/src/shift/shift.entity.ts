import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { NurseEntity } from '../nurse/nurse.entity';
import { ScheduleEntity } from '../schedule/schedule.entity';
import { Exclude } from 'class-transformer';

export type ShiftType = 'day' | 'night';
export type ShiftRequirements = {
  shift: ShiftType;
  nursesRequired: number;
  dayOfWeek: string;
};

@Entity('shifts')
export class ShiftEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'varchar', length: 10 })
  type: ShiftType;

  @ManyToOne(() => NurseEntity, (nurse) => nurse.shifts)
  nurse: NurseEntity;

  @ManyToOne(() => ScheduleEntity, (schedule) => schedule.shifts)
  @Exclude()
  schedule: ScheduleEntity;
}
