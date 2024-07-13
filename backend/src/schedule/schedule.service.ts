import { Injectable, NotImplementedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleEntity } from './schedule.entity';
import { NurseEntity, NursePreference } from '../nurse/nurse.entity';

import { NurseService } from '../nurse/nurse.service';
import { ShiftService } from '../shift/shift.service';
import { ShiftEntity, ShiftRequirements, ShiftType } from '../shift/shift.entity';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(ScheduleEntity)
    private readonly scheduleRepository: Repository<ScheduleEntity>,

    @InjectRepository(ShiftEntity)
    private readonly shiftRepository: Repository<ShiftEntity>,

    private readonly nurseService: NurseService,
    private readonly shiftService: ShiftService,
  ) { }

  // convert a string like "Monday" to a Date object 
  private convertDayToDate(day: string): Date {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayIndex = daysOfWeek.indexOf(day);

    if (dayIndex === -1) {
      throw new Error('Invalid day name');
    }

    const currentDate = new Date();
    const daysToAdd = (dayIndex + 7 - currentDate.getDay()) % 7;

    currentDate.setDate(currentDate.getDate() + daysToAdd);

    return currentDate;
  }

  async generateSchedule(startDate: Date, endDate: Date): Promise<any> {
    // note: unsure what startDate and endDate are for, since generateSchedule
    // recalculates the entire schedule for every nurse, from Mon - Sun 

    const nurses = await this.nurseService.getNurses();
    const shiftRequirements = await this.shiftService.getShiftRequirements();

    // Initialize the schedule
    const schedule = new ScheduleEntity();
    schedule.shifts = [];

    // Assign nurses to shifts based on preferences
    const unfilledShifts: { shiftRequirement: ShiftRequirements; missingNurses: number }[] = [];

    for (const shiftRequirement of shiftRequirements) {
      const { shift, nursesRequired, dayOfWeek } = shiftRequirement;

      // Accumulate nurses who prefer this shift
      const nursesWithPreference = [];

      for (const nurse of nurses) {
        if (nurse.preferences && nurse.preferences.some(preference => preference.day === dayOfWeek && preference.shift === shift)) {
          nursesWithPreference.push(nurse);
        }

        // Check if the required number of nurses has been reached
        if (nursesWithPreference.length >= nursesRequired) {
          break;
        }
      }

      console.log("nursesWithPreference", nursesWithPreference)

      // Check if the shift has not been filled
      const missingNurses = Math.max(0, nursesRequired - nursesWithPreference.length);

      if (missingNurses > 0) {
        unfilledShifts.push({ shiftRequirement, missingNurses });
      }

      // Assign nurses to this shift until the required number is reached
      for (const assignedNurse of nursesWithPreference) {
        // Create a new ShiftEntity
        const shiftEntity = new ShiftEntity();
        shiftEntity.date = this.convertDayToDate(dayOfWeek);
        shiftEntity.type = shift;
        shiftEntity.nurse = assignedNurse;

        // Add the shift to the schedule
        schedule.shifts.push(shiftEntity);
      }
    }

    // Iterate through each unfilled shift and assign nurses
    for (const { shiftRequirement, missingNurses } of unfilledShifts) {
      const { dayOfWeek, shift } = shiftRequirement;

      for (let i = 0; i < missingNurses; i++) {
        // Find the nearest nurse preference for the current shift
        const nearestNurse = this.findNearestNurse(nurses, schedule, dayOfWeek, shift);
        console.log("nearestNurse:", nearestNurse)
        if (nearestNurse) {
          // Assign the nurse to the current shift
          const shiftEntity = new ShiftEntity();
          shiftEntity.date = this.convertDayToDate(dayOfWeek);
          shiftEntity.type = shift;
          shiftEntity.nurse = nearestNurse;

          // Add the shift to the schedule
          schedule.shifts.push(shiftEntity);
        } else {
          break;
        }
      }
    }

    // Note: at this point, a potential addition to the algorithm involves finding nurses that haven't been assigned any shifts, and randomly assigning them one.
    // This is b/c it is possible that some nurses don't get assigned to any shifts with this algorithm, if they don't have any preferences. However, I'd assume in most real-world scenarios,
    // every nurse has at least one preference (otherwise, what's the point of trying to account for them), in which case this step wouldn't be necessary.

    // Find nurses without any assigned shifts
    const nursesWithoutShifts = nurses.filter(nurse => !schedule.shifts.some(shift => shift.nurse.id === nurse.id));

    for (const nurseWithoutShifts of nursesWithoutShifts) {
      // Check if the nurse has preferences
      if (nurseWithoutShifts.preferences && nurseWithoutShifts.preferences.length > 0) {
        // Assign the nurse to all their preferences
        for (const preference of nurseWithoutShifts.preferences) {
          const shiftEntity = new ShiftEntity();
          shiftEntity.date = this.convertDayToDate(preference.day);
          shiftEntity.type = preference.shift as ShiftType;
          shiftEntity.nurse = nurseWithoutShifts;

          schedule.shifts.push(shiftEntity);
        }
      } else {
        // If the nurse has no preferences, assign them one random shift
        const randomShiftRequirement = this.getRandomShiftRequirement(shiftRequirements);

        if (randomShiftRequirement) {
          const shiftEntity = new ShiftEntity();
          shiftEntity.date = this.convertDayToDate(randomShiftRequirement.dayOfWeek);
          shiftEntity.type = randomShiftRequirement.shift;
          shiftEntity.nurse = nurseWithoutShifts;

          schedule.shifts.push(shiftEntity);
        }
      }
    }

    // Save the new schedule
    const savedSchedule = await this.scheduleRepository.save(schedule);

    return savedSchedule;
  }

  // Helper function to get a random shift requirement
  private getRandomShiftRequirement(shiftRequirements: ShiftRequirements[]): ShiftRequirements | undefined {
    if (shiftRequirements.length > 0) {
      const randomIndex = Math.floor(Math.random() * shiftRequirements.length);
      return shiftRequirements[randomIndex];
    }

    return undefined;
  }

  // Helper function to find nearest nurse for given day of week and shift type
  private findNearestNurse(nurses: NurseEntity[], schedule: ScheduleEntity, dayOfWeek: string, shiftType: ShiftType): NurseEntity | null {
    let closestNurse: NurseEntity | null = null;
    let minDistance = Infinity; // Start with a large distance

    console.log("nurses", nurses)

    // Iterate through all nurses
    for (const nurse of nurses) {
      console.log("in loop");

      // Check if the nurse is already assigned to a shift on the same day with the specified shiftType
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      const isAlreadyAssigned = schedule.shifts.some(
        shift => shift.nurse.id === nurse.id &&
          shift.type === shiftType &&
          daysOfWeek[shift.date.getDay()] === dayOfWeek
      );

      if (isAlreadyAssigned) {
        console.log("This nurse alr assigned, skipping")
        continue; // Skip this nurse if already assigned to the shift
      }

      let nearestDistance = 0.5; // Default distance for a nurse with no preferences

      // Iterate through each preference of the nurse
      for (const preference of nurse.preferences || []) {
        if (preference.shift === shiftType) {
          const distance = nurse.preferences.length / this.calculateDistance(dayOfWeek, preference);
          console.log("distance", distance)

          if (distance < minDistance) {
            minDistance = distance;
            closestNurse = nurse;
            console.log("1: cloestnurst", closestNurse)
          }
        }
      }

      // If the nurse has no preferences, update the distance based on the default
      console.log("nurse preferences and nearest distance", nurse.preferences, nearestDistance, minDistance)
      if ((!nurse.preferences || nurse.preferences.length === 0) && nearestDistance < minDistance) {
        minDistance = nearestDistance;
        closestNurse = nurse;
        console.log("2: cloestnurst", closestNurse)
      }

      // If the minimum distance is <= 1, immediately return the closest nurse
      if (minDistance <= 1) {
        console.log("If the minimum distance is <= 2, return the closest nurse")
        console.log("3: cloestnurst", closestNurse)
        return closestNurse;
      }
    }

    console.log("4: cloestnurst", closestNurse)
    if (!closestNurse) {
      console.log("cloest nurse is nill!")
    }

    return closestNurse;
  }


  private calculateDistance(dayOfWeek: string, preference: NursePreference): number {
    // Get the day index for the preference and the current day of the week
    const preferenceDayIndex = this.getDayIndex(preference.day);
    const currentDayIndex = this.getDayIndex(dayOfWeek);

    // Calculate the distance as the absolute difference in days
    const distance = Math.abs(preferenceDayIndex - currentDayIndex);

    return distance;
  }



  private getDayIndex(dayOfWeek: string): number {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return daysOfWeek.indexOf(dayOfWeek);
  }


  async getSchedules(): Promise<any> {
    const schedules = await this.scheduleRepository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.shifts', 'shifts')
      .leftJoinAndSelect('shifts.nurse', 'nurse')
      .getMany();

    return schedules;
  }

  async getScheduleById(id: number): Promise<any> {
    return this.scheduleRepository.findOneByOrFail({ id });
  }

  async getScheduleRequirements(): Promise<any> {
    // TODO: Complete the implementation of this method
    // Schedule requirements can be hard-coded
    // Requirements must indicate the number of nurses required for each shift type on each day of a week
    // Create the requirements as JSON and make it available via this method

    // Note: I'm confused about this function, seems like getShiftRequirements in shift.service.ts already does this. 
    // Leaving this function as it is.
    throw new NotImplementedException();
  }
}
