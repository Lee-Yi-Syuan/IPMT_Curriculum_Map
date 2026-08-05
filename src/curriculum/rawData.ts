export interface RawCourse {
  specialty: string;
  specialtyType: string;
  semester: string;
  name: string;
  type: string;
  credits: number;
  suggestedPrerequisites: string[];
  requiredPrerequisites: string[];
  notes?: string; // 支援備註欄位
}

import jsonData from './2.json';

export const RAW_COURSES: RawCourse[] = jsonData as RawCourse[];