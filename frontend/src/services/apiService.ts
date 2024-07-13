import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const instance = axios.create({
  baseURL: API_BASE_URL,
});

export default {
  // Nurse endpoints
  getNurses: async () => {
    const { data } = await instance.get('/nurses');
    return data;
  },
  getNursePreferences: async (id: number) => {
    const { data } = await instance.get(`/nurses/${id}/preferences`);
    return data;
  },
  getNurseById: async (id: number) => {
    const { data } = await instance.get(`/nurses/${id}`);
    return data;
  },
  setNursePreferences: async (id: number, preferences: unknown) => {
    const { data } = await instance.post(`/nurses/preferences`, { id, preferences });
    return data;
  },

  // Shift endpoints
  getAllShifts: async () => {
    const { data } = await instance.get('/shifts');
    return data;
  },
  getShiftsByNurse: async (nurseId: number) => {
    const { data } = await instance.get(`/shifts/nurse/${nurseId}`);
    return data;
  },
  getShiftsBySchedule: async (scheduleId: number) => {
    const { data } = await instance.get(`/shifts/schedule/${scheduleId}`);
    return data;
  },
  getShiftRequirements: async () => {
    const { data } = await instance.get(`/shifts/requirements`);
    return data;
  },

  // Schedule endpoints
  generateSchedule: async (startDate: Date, endDate: Date) => {
    const { data } = await instance.post(`/schedules/generate`, { startDate, endDate });
    return data;
  },
  getSchedules: async () => {
    const { data } = await instance.get('/schedules');
    return data;
  },
  getSchedule: async (id: number) => {
    const { data } = await instance.get(`/schedules/${id}`);
    return data;
  },
};
