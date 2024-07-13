import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';

import { ShiftEntity } from '../shift/shift.entity';

export interface NursePreference {
  day: string;
  shift: string;
}

@Entity('nurses')
export class NurseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  name: string;

  @Column('json', { nullable: true })
  preferences: NursePreference[];

  @OneToMany(() => ShiftEntity, shift => shift.nurse) // one nurse maps to many shifts
  shifts: ShiftEntity[];
}
