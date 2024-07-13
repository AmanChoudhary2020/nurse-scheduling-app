import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/apiService';

type NursePreference = {
    day: string;
    shift: string;
};

type Nurse = {
    id: number;
    name: string;
    preferences: NursePreference[] | null;
};

type ScheduleShift = {
    date: string;
    type: string;
    nurse: Nurse;
};

type Schedule = {
    shifts: ScheduleShift[];
    id: number;
    created: string;
    updated: string;
};

type ShiftRequirement = {
    shift: string;
    nursesRequired: string;
    dayOfWeek: string;
};

const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Helper function to check if a nurse is assigned to a specific shift on a given day
const isNurseAssigned = (nurseId: number, shift: string, day: string, schedules: Schedule | null) => {
    if (!schedules || typeof schedules !== 'object' || !('shifts' in schedules)) {
        return false;
    } else {
        // Check if shifts property exists and is an array
        if (Array.isArray(schedules.shifts)) {
            // Iterate through each shift in the shifts array and check if the nurse is assigned to the specified shift on the given day
            return schedules.shifts.some((shiftData: any) => {
                if (!shiftData.date) {
                    return false;
                }

                const dateString = shiftData.date;
                const dateComponents = dateString.split('-');
                const year = parseInt(dateComponents[0], 10);
                const month = parseInt(dateComponents[1], 10) - 1; // Months are 0-indexed in JavaScript
                const dayOfWeek = new Date(year, month, parseInt(dateComponents[2], 10)).getDay();
                return (
                    shiftData.nurse &&
                    shiftData.nurse.id === nurseId &&
                    shiftData.type.toLowerCase() === shift.toLowerCase() &&
                    weekdayNames[dayOfWeek].toLowerCase() === day.toLowerCase()
                );
            });
        }
        return false;
    }
};

const Home: React.FC = () => {
    const [nurses, setNurses] = useState<unknown[] | null>(null);
    const [requirements, setRequirements] = useState<ShiftRequirement[] | null>(null);
    const [schedules, setSchedules] = useState<Schedule | null>(null);
    const [shiftsFulfilled, setShiftsFulfilled] = useState<Record<string, boolean> | null>(null);

    // Fetch nurses
    useEffect(() => {
        const fetchNurses = async () => {
            const nurses = await api.default.getNurses(); // TODO: this appears to be getting called twice on page load... why? (solution: removed strict mode in App.tsx)
            setNurses(nurses);
        }

        fetchNurses().catch(console.error);
    }, []);

    // Fetch shift requirements
    useEffect(() => {
        const fetchRequirements = async () => {
            const requirements = await api.default.getShiftRequirements();
            setRequirements(requirements);
        }

        fetchRequirements().catch(console.error);
    }, []);

    // Fetch latest schedule
    useEffect(() => {
        const fetchSchedules = async () => {
            // Fetch all schedules
            const allSchedules = await api.default.getSchedules();

            // If there are no schedules, call generateSchedules
            if (allSchedules.length === 0) {
                const today = new Date();
                const startOfWeek = today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1);
                const startDate = new Date(today.setDate(startOfWeek));

                // Set endDate to upcoming Sunday
                const endOfWeek = startOfWeek + 6;
                const endDate = new Date(today.setDate(endOfWeek));

                const generatedSchedules = await api.default.generateSchedule(startDate, endDate);
                console.log("no schedules, generated a new one", generatedSchedules);
                setSchedules(generatedSchedules);
            } else {
                // If there are schedules, use the latest schedule
                const latestSchedule = allSchedules[allSchedules.length - 1];
                console.log("latest schedule", latestSchedule);
                setSchedules(latestSchedule);
            }
        };
        fetchSchedules().catch(console.error);
    }, []);

    // Update which shift requirements have been met
    useEffect(() => {
        // Check if schedules and shiftRequirements are available
        if (requirements !== null && schedules !== null && typeof schedules === 'object' && 'shifts' in schedules) {
            // Create a map to track if each shift is fulfilled
            const shiftFulfillmentMap: { [key: string]: boolean } = {};

            // Iterate through each shift requirement
            requirements.forEach(requirement => {
                const { shift, nursesRequired, dayOfWeek } = requirement;

                // Filter the schedules for the specific day and shift
                const relevantSchedules = schedules.shifts.filter(schedule => {
                    if (!schedule.date) {
                        return false;
                    }

                    const dateString = schedule.date;
                    const dateComponents = dateString.split('-');
                    const year = parseInt(dateComponents[0], 10);
                    const month = parseInt(dateComponents[1], 10) - 1; // Months are 0-indexed in JavaScript
                    const dayOfWeekFromSchedule = new Date(year, month, parseInt(dateComponents[2], 10)).getDay();

                    // Check if the actual day matches the day from the requirement
                    return weekdayNames[dayOfWeekFromSchedule].toLowerCase() === dayOfWeek.toLowerCase() && schedule.type === shift;
                });

                // Check if the number of nurses assigned meets the requirement
                const isFulfilled = relevantSchedules.length >= parseInt(nursesRequired, 10);

                // Assign the shift as true if fulfilled, false otherwise
                shiftFulfillmentMap[`${dayOfWeek}-${shift}`] = isFulfilled;
            });

            // Update the shiftsFulfilled state using setShiftsFulfilled
            setShiftsFulfilled(shiftFulfillmentMap);
        }
    }, [schedules, requirements, setShiftsFulfilled]);


    return (
        <>
            <h1>Nurse Scheduling Exercise</h1>
            <div className='card'>
                <h2>Nurses</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {nurses && (nurses.map((nurse: any) => (
                            <tr key={nurse.id}>
                                <td>{nurse.id}</td>
                                <td><Link to={`/nurses/${nurse.id}`}>{nurse.name}</Link></td>
                            </tr>
                        )))}
                    </tbody>
                </table>
            </div >
            <div className='card'>
                <h2>Shift Requirements</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Day</th>
                            <th>Shift</th>
                            <th>Nurses required</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requirements && (requirements.map((req: any) => (
                            <tr key={req.dayOfWeek + "-" + req.shift}>
                                <td>{req.dayOfWeek}</td>
                                <td>{req.shift}</td>
                                <td>{req.nursesRequired}</td>
                            </tr>
                        )))}
                    </tbody>
                </table>
            </div>
            <div className='card'>
                <h2>Schedules</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Nurse</th>
                            {requirements && requirements.map((req) => (
                                <th key={`${req.dayOfWeek}-${req.shift}`} style={{ backgroundColor: shiftsFulfilled ? (shiftsFulfilled[`${req.dayOfWeek}-${req.shift}`] ? 'green' : 'red') : 'red' }}>
                                    {`${req.dayOfWeek} ${req.shift}`}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {nurses && nurses.map((nurse: any) => (
                            <tr key={nurse.id}>
                                <td>{nurse.name}</td>
                                <td style={{ backgroundColor: isNurseAssigned(nurse.id, 'day', 'Monday', schedules) ? 'mediumseagreen' : 'grey' }}></td>
                                <td style={{ backgroundColor: isNurseAssigned(nurse.id, 'night', 'Monday', schedules) ? 'mediumseagreen' : 'grey' }}></td>
                                <td style={{ backgroundColor: isNurseAssigned(nurse.id, 'day', 'Tuesday', schedules) ? 'mediumseagreen' : 'grey' }}></td>
                                <td style={{ backgroundColor: isNurseAssigned(nurse.id, 'night', 'Tuesday', schedules) ? 'mediumseagreen' : 'grey' }}></td>
                                <td style={{ backgroundColor: isNurseAssigned(nurse.id, 'day', 'Wednesday', schedules) ? 'mediumseagreen' : 'grey' }}></td>
                                <td style={{ backgroundColor: isNurseAssigned(nurse.id, 'night', 'Wednesday', schedules) ? 'mediumseagreen' : 'grey' }}></td>
                                <td style={{ backgroundColor: isNurseAssigned(nurse.id, 'day', 'Thursday', schedules) ? 'mediumseagreen' : 'grey' }}></td>
                                <td style={{ backgroundColor: isNurseAssigned(nurse.id, 'night', 'Thursday', schedules) ? 'mediumseagreen' : 'grey' }}></td>
                                <td style={{ backgroundColor: isNurseAssigned(nurse.id, 'day', 'Friday', schedules) ? 'mediumseagreen' : 'grey' }}></td>
                                <td style={{ backgroundColor: isNurseAssigned(nurse.id, 'night', 'Friday', schedules) ? 'mediumseagreen' : 'grey' }}></td>
                                <td style={{ backgroundColor: isNurseAssigned(nurse.id, 'day', 'Saturday', schedules) ? 'mediumseagreen' : 'grey' }}></td>
                                <td style={{ backgroundColor: isNurseAssigned(nurse.id, 'night', 'Saturday', schedules) ? 'mediumseagreen' : 'grey' }}></td>
                                <td style={{ backgroundColor: isNurseAssigned(nurse.id, 'day', 'Sunday', schedules) ? 'mediumseagreen' : 'grey' }}></td>
                                <td style={{ backgroundColor: isNurseAssigned(nurse.id, 'night', 'Sunday', schedules) ? 'mediumseagreen' : 'grey' }}></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default Home;
