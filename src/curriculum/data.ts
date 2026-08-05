import { RAW_COURSES, type RawCourse } from './rawData';

// 1. 新增 college_required 到 CourseTag 型別
export type CourseTag = 'college_required' | 'required' | 'elective' | 'recommended';

export type Semester = 'F1' | 'S1' | 'F2' | 'S2' | 'F3' | 'S3' | 'F4' | 'S4';

export interface Specialty {
  key: string;
  name: string;
  type: 'first' | 'second';
  typeName: string;
}

export interface Course {
  id: string;
  name: string;
  specialtyKey: string;
  specialtyName: string;
  tag: CourseTag;
  credits: number;
  semester: Semester;
  prereqs: string[];
  requiredPrereqs: string[];
  notes?: string; // 支援備註欄位
}

export const SEMESTERS: { id: Semester; label: string }[] = [
  { id: 'F1', label: '大一上' },
  { id: 'S1', label: '大一下' },
  { id: 'F2', label: '大二上' },
  { id: 'S2', label: '大二下' },
  { id: 'F3', label: '大三上' },
  { id: 'S3', label: '大三下' },
  { id: 'F4', label: '大四上' },
  { id: 'S4', label: '大四下' },
];

const SEMESTER_MAP: Record<string, Semester> = {
  '1-1': 'F1', '1-2': 'S1',
  '2-1': 'F2', '2-2': 'S2',
  '3-1': 'F3', '3-2': 'S3',
  '4-1': 'F4', '4-2': 'S4',
};

// 2. 對應新增「院訂必修」與「院訂」
const TAG_MAP: Record<string, CourseTag> = {
  '院訂必修': 'college_required',
  '院訂': 'college_required',
  '必修': 'required',
  '選修': 'elective',
  '建議先修': 'recommended',
};

// 3. 設定「院訂」的標籤樣式 (咖啡色系 bg-amber-900/10 + text-amber-900 + border-amber-300)
export const TAG_META: Record<CourseTag, { label: string; className: string }> = {
  college_required: { 
    label: '院訂', 
    className: 'bg-amber-900/10 text-amber-900 border-amber-300/80 bg-amber-50/50' 
  },
  required: { label: '必修', className: 'bg-red-100 text-red-700 border-red-200' },
  elective: { label: '選修', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  recommended: { label: '建議', className: 'bg-amber-100 text-amber-700 border-amber-200' },
};

// First specialty（第一專長固定為暖色系）
const FIRST_SPEC_COLORS = [
  { card: 'bg-amber-50/40', border: 'border-amber-900/20', glow: 'shadow-amber-200/20', accent: 'text-amber-800' },
  { card: 'bg-amber-50/70', border: 'border-amber-200', glow: 'shadow-amber-400/30', accent: 'text-amber-700' },     
  { card: 'bg-orange-50/60', border: 'border-orange-200', glow: 'shadow-orange-400/30', accent: 'text-orange-700' }, 
  { card: 'bg-yellow-50/70', border: 'border-yellow-200', glow: 'shadow-yellow-400/30', accent: 'text-yellow-700' }, 
  { card: 'bg-pink-50/60', border: 'border-pink-200', glow: 'shadow-pink-300/30', accent: 'text-pink-600' },         
  { card: 'bg-lime-50/50', border: 'border-lime-200', glow: 'shadow-lime-300/30', accent: 'text-lime-700' },         
  { card: 'bg-amber-50/40', border: 'border-orange-150', glow: 'shadow-orange-300/20', accent: 'text-amber-800' },  
  { card: 'bg-orange-50/30', border: 'border-amber-200', glow: 'shadow-amber-300/20', accent: 'text-orange-800' },   
  { card: 'bg-yellow-50/40', border: 'border-yellow-150', glow: 'shadow-yellow-300/20', accent: 'text-yellow-800' }, 
  { card: 'bg-amber-50/30', border: 'border-amber-150', glow: 'shadow-amber-200/20', accent: 'text-amber-900' },     
];

// Second specialty（第二專長固定為冷色系）
const SECOND_SPEC_COLORS = [
  { card: 'bg-sky-100/90', border: 'border-sky-300', glow: 'shadow-sky-400/30', accent: 'text-sky-700' },
  { card: 'bg-sky-50/70', border: 'border-sky-200', glow: 'shadow-sky-400/30', accent: 'text-sky-700' },
  { card: 'bg-teal-100/50', border: 'border-teal-300', glow: 'shadow-teal-400/30', accent: 'text-teal-800' },
  { card: 'bg-indigo-100/60', border: 'border-indigo-300', glow: 'shadow-indigo-400/30', accent: 'text-indigo-800' },
  { card: 'bg-lime-100/60', border: 'border-lime-300', glow: 'shadow-lime-400/30', accent: 'text-lime-800' },
  { card: 'bg-violet-100/50', border: 'border-violet-300', glow: 'shadow-violet-400/30', accent: 'text-violet-800' },
  { card: 'bg-cyan-100/50', border: 'border-cyan-300', glow: 'shadow-cyan-400/30', accent: 'text-cyan-800' },
  { card: 'bg-emerald-100/60', border: 'border-emerald-300', glow: 'shadow-emerald-400/30', accent: 'text-emerald-800' },
  { card: 'bg-purple-100/50', border: 'border-purple-300', glow: 'shadow-purple-400/30', accent: 'text-purple-800' },
];

function processData() {
  const specialties: Specialty[] = [];
  const specialtyMap = new Map<string, Specialty>();
  const courses: Course[] = [];

  const groups = new Map<string, RawCourse[]>();
  for (const rc of RAW_COURSES) {
    const type: 'first' | 'second' = rc.specialtyType === '一專' ? 'first' : 'second';
    const key = `${rc.specialty}__${type}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(rc);
  }

  let firstIdx = 0;
  let secondIdx = 0;

  for (const [key, raws] of groups) {
    const [name, typeStr] = key.split('__');
    const type = typeStr as 'first' | 'second';
    const specKey = `${type === 'first' ? 'f' : 's'}-${type === 'first' ? firstIdx : secondIdx}`;

    const spec: Specialty = {
      key: specKey,
      name,
      type,
      typeName: type === 'first' ? '一專' : '二專',
    };
    specialties.push(spec);
    specialtyMap.set(key, spec);

    if (type === 'first') firstIdx++;
    else secondIdx++;

    const nameToId = new Map<string, string>();
    raws.forEach((rc, i) => {
      const id = `${specKey}-${i}`;
      nameToId.set(rc.name, id);
    });

    raws.forEach((rc, i) => {
      const id = `${specKey}-${i}`;
      const prereqIds = rc.suggestedPrerequisites
        .map((pname) => nameToId.get(pname))
        .filter((pid): pid is string => pid !== undefined);
      const requiredPrereqIds = (rc.requiredPrerequisites ?? [])
        .map((pname) => nameToId.get(pname))
        .filter((pid): pid is string => pid !== undefined);

      courses.push({
        id,
        name: rc.name,
        specialtyKey: specKey,
        specialtyName: name,
        tag: TAG_MAP[rc.type] ?? 'elective',
        credits: rc.credits,
        semester: SEMESTER_MAP[rc.semester] ?? 'F1',
        prereqs: prereqIds,
        requiredPrereqs: requiredPrereqIds,
        notes: (rc as any).notes ?? '',
      });
    });
  }

  return { specialties, courses };
}

const { specialties: ALL_SPECIALTIES, courses: ALL_COURSES } = processData();

export const SPECIALTIES = ALL_SPECIALTIES;
export const COURSES = ALL_COURSES;

export const FIRST_SPECIALTY_OPTIONS = ALL_SPECIALTIES.filter((s) => s.type === 'first');
export const SECOND_SPECIALTY_OPTIONS = ALL_SPECIALTIES.filter((s) => s.type === 'second');

export const DEFAULT_FIRST: string = FIRST_SPECIALTY_OPTIONS.find((s) => s.name === '計量財務金融')?.key ?? FIRST_SPECIALTY_OPTIONS[0].key;
export const DEFAULT_SECOND: string = SECOND_SPECIALTY_OPTIONS.find((s) => s.name === '資訊工程')?.key ?? SECOND_SPECIALTY_OPTIONS[0].key;

export function getSpecialtyByKey(key: string): Specialty | undefined {
  return ALL_SPECIALTIES.find((s) => s.key === key);
}

// 保持完整輸出，一律顯示重名課程
export function getCoursesForSpecialties(keys: string[]): Course[] {
  return ALL_COURSES.filter((c) => keys.includes(c.specialtyKey));
}

export function getSpecialtyColor(specialtyKey: string, isFirst: boolean): { card: string; border: string; glow: string; accent: string } {
  if (isFirst) {
    const idx = FIRST_SPECIALTY_OPTIONS.findIndex((s) => s.key === specialtyKey);
    return FIRST_SPEC_COLORS[idx % FIRST_SPEC_COLORS.length];
  } else {
    const idx = SECOND_SPECIALTY_OPTIONS.findIndex((s) => s.key === specialtyKey);
    return SECOND_SPEC_COLORS[idx % SECOND_SPEC_COLORS.length];
  }
}

export function getSpecialtyColors(keys: string[]): Record<string, { card: string; border: string; glow: string; accent: string }> {
  const result: Record<string, { card: string; border: string; glow: string; accent: string }> = {};
  for (const key of keys) {
    const spec = getSpecialtyByKey(key);
    if (spec) {
      result[key] = getSpecialtyColor(key, spec.type === 'first');
    }
  }
  return result;
}

// 找出兩個專長中重名的課程名稱，供前端觸發警告使用
export function getDuplicateCourseNames(keys: string[]): Set<string> {
  const nameBySpec = new Map<string, Set<string>>();
  for (const key of keys) {
    const names = new Set<string>();
    for (const c of ALL_COURSES) {
      if (c.specialtyKey === key) names.add(c.name);
    }
    nameBySpec.set(key, names);
  }
  const sets = Array.from(nameBySpec.values());
  if (sets.length < 2) return new Set();
  const result = new Set<string>();
  for (const name of sets[0]) {
    if (sets.slice(1).every((s) => s.has(name))) {
      result.add(name);
    }
  }
  return result;
}

/**
 * 特殊課程公告網址對照判斷
 */
export function getNoticeUrlForCourse(courseName: string): string | undefined {
  if (courseName.includes('HSS人類學學程選修課程')) {
    return 'https://dhss.site.nthu.edu.tw/p/405-1610-280323,c21847.php?Lang=zh-tw';
  }

  if (courseName.includes('HSS文創學程選修課程')) {
    return 'https://dhss.site.nthu.edu.tw/p/405-1610-280664,c21847.php?Lang=zh-tw';
  }

  if (courseName.includes('HSS歷史學程選修課程')) {
    return 'https://dhss.site.nthu.edu.tw/p/405-1610-280319,c21847.php?Lang=zh-tw';
  }

  if (courseName.includes('HSS社會學學程選修課程')) {
    return 'https://dhss.site.nthu.edu.tw/p/405-1610-279738,c21847.php?Lang=zh-tw';
  }

  if (courseName.includes('HSS哲學學程選修課程')) {
    return 'https://dhss.site.nthu.edu.tw/p/405-1610-280663,c21847.php?Lang=zh-tw';
  }

  return undefined;
}