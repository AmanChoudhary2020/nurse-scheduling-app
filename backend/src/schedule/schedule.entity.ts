import { Entity, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ShiftEntity } from '../shift/shift.entity';

@Entity('schedules')
export class ScheduleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => ShiftEntity, (shift) => shift.schedule, { eager: true, cascade: ['insert', 'update'] })
  shifts: ShiftEntity[];

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;
}
