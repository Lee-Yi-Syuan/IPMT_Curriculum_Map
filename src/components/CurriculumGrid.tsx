import { useRef, useState, useLayoutEffect, useCallback } from 'react';
import {
  SEMESTERS,
  getSpecialtyColors,
  getDuplicateCourseNames,
  getSpecialtyByKey,
  type Course,
} from '../curriculum/data';
import CourseCard, { type HighlightState } from './CourseCard';

interface CurriculumGridProps {
  courses: Course[];
  activeId: string | null;
  hoverId: string | null;
  onHover: (id: string | null) => void;
  onClick: (id: string | null) => void;
  specialtyKeys: string[];
}

interface Edge {
  id: string;
  x1: number; y1: number;
  x2: number; y2: number;
  type: 'prereq' | 'dependent';
  isRequired: boolean;
}

function getRelatedSet(courses: Course[], activeId: string) {
  const prereqs = new Set<string>();
  const requiredPrereqs = new Set<string>();
  const dependents = new Set<string>();
  const courseMap = new Map(courses.map((c) => [c.id, c]));

  const active = courseMap.get(activeId);
  if (active) {
    active.prereqs?.forEach((p) => { if (courseMap.has(p)) prereqs.add(p); });
    active.requiredPrereqs?.forEach((p) => { if (courseMap.has(p)) requiredPrereqs.add(p); });
  }
  courses.forEach((c) => {
    if (c.prereqs?.includes(activeId) || c.requiredPrereqs?.includes(activeId)) dependents.add(c.id);
  });
  return { prereqs, requiredPrereqs, dependents };
}

export default function CurriculumGrid({
  courses, activeId, hoverId, onHover, onClick, specialtyKeys,
}: CurriculumGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [containerRect, setContainerRect] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [edges, setEdges] = useState<Edge[]>([]);

  const colorsMap = getSpecialtyColors(specialtyKeys);
  const duplicateNames = getDuplicateCourseNames(specialtyKeys);
  const duplicateSpecTwoIds = new Set<string>();
  const specTwoKey = specialtyKeys[1];
  for (const c of courses) {
    if (c.specialtyKey === specTwoKey && duplicateNames.has(c.name)) {
      duplicateSpecTwoIds.add(c.id);
    }
  }

  const registerRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) cardRefs.current.set(id, el);
    else cardRefs.current.delete(id);
  }, []);

  const focusId = activeId ?? hoverId;

  const computeEdges = useCallback(() => {
    const container = containerRef.current;
    if (!container || !focusId) { setEdges([]); return; }
    const cRect = container.getBoundingClientRect();
    setContainerRect({ w: cRect.width, h: cRect.height });

    const { prereqs, requiredPrereqs, dependents } = getRelatedSet(courses, focusId);
    const out: Edge[] = [];
    const make = (fromId: string, toId: string, type: 'prereq' | 'dependent', isRequired: boolean) => {
      const fEl = cardRefs.current.get(fromId);
      const tEl = cardRefs.current.get(toId);
      if (!fEl || !tEl) return;
      const f = fEl.getBoundingClientRect();
      const t = tEl.getBoundingClientRect();
      out.push({
        id: `${fromId}->${toId}`,
        x1: f.left - cRect.left + f.width / 2,
        y1: f.top - cRect.top + f.height / 2,
        x2: t.left - cRect.left + t.width / 2,
        y2: t.top - cRect.top + t.height / 2,
        type, isRequired,
      });
    };

    prereqs.forEach((pid) => make(pid, focusId, 'prereq', requiredPrereqs.has(pid)));
    dependents.forEach((did) => {
      const depCourse = courses.find((c) => c.id === did);
      const isReq = depCourse ? depCourse.requiredPrereqs?.includes(focusId) : false;
      make(focusId, did, 'dependent', isReq);
    });

    setEdges(out);
  }, [focusId, courses]);

  useLayoutEffect(() => {
    computeEdges();
    const handleResize = () => computeEdges();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [computeEdges]);

  const getHighlight = useCallback(
    (course: Course): HighlightState => {
      if (!focusId) return 'none';
      if (course.id === focusId) return 'active';
      const { prereqs, dependents } = getRelatedSet(courses, focusId);
      if (prereqs.has(course.id)) return 'prereq';
      if (dependents.has(course.id)) return 'dependent';
      return 'dim';
    }, [focusId, courses]
  );

  const getPrereqNames = useCallback(
    (course: Course): string[] =>
      (course.prereqs || [])
        .map((pid) => courses.find((c) => c.id === pid)?.name)
        .filter((n): n is string => n !== undefined),
    [courses]
  );

  // 1. 專長排序權重：一專 (0) > 二專 (1)
  const getSpecWeight = (c: Course) => {
    const spec = getSpecialtyByKey(c.specialtyKey);
    return spec?.type === 'first' ? 0 : 1;
  };

  // 2. 課程類別排序權重：院訂必修 (0) > 必修 (1) > 選修 (2) > 建議先修 (3)
  const getTagWeight = (c: Course) => {
    if (c.tag === 'college_required') return 0;
    if (c.tag === 'required') return 1;
    if (c.tag === 'elective') return 2;
    if (c.tag === 'recommended') return 3;
    return 4;
  };

  const coursesBySemester = SEMESTERS.map((sem) => {
    const items = courses
      .filter((c) => c.semester === sem.id)
      .sort((a, b) => {
        // 先比對專長（一專優先於二專）
        const specDiff = getSpecWeight(a) - getSpecWeight(b);
        if (specDiff !== 0) return specDiff;

        // 若專長相同，再比對類別（院訂必修 > 必修 > 選修 > 建議）
        return getTagWeight(a) - getTagWeight(b);
      });

    return { sem, items };
  });

  const labelFor = (e: Edge) => {
    const mx = (e.x1 + e.x2) / 2;
    const my = (e.y1 + e.y2) / 2;
    return { mx, my };
  };

  return (
    <div 
      className="relative overflow-x-auto min-h-[500px]"
      onClick={() => onClick(null)} // 點擊空白處取消選取
    >
      <div ref={containerRef} className="relative min-w-[1100px]">
        <svg
          className="pointer-events-none absolute inset-0 z-30"
          width={containerRect.w}
          height={containerRect.h}
          style={{ overflow: 'visible' }}
        >
          <defs>
            <marker id="arrow-prereq" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
            </marker>
            <marker id="arrow-dependent" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#8b5cf6" />
            </marker>
            <marker id="arrow-required" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#f87171" />
            </marker>
          </defs>
          {edges.map((e) => {
            const stroke = e.isRequired ? '#f87171' : (e.type === 'prereq' ? '#10b981' : '#8b5cf6');
            const marker = e.isRequired ? 'url(#arrow-required)' : (e.type === 'prereq' ? 'url(#arrow-prereq)' : 'url(#arrow-dependent)');
            const { mx, my } = labelFor(e);
            return (
              <g key={e.id}>
                <line
                  x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                  stroke={stroke}
                  strokeWidth={e.isRequired ? 2.5 : 2}
                  strokeDasharray={e.isRequired ? '9 3' : '6 4'}
                  markerEnd={marker}
                  className="animate-[dashFlow_1s_linear_infinite]"
                  opacity="0.9"
                />
                {e.isRequired && (
                  <g transform={`translate(${mx}, ${my})`}>
                    <rect x="-18" y="-8" width="36" height="16" rx="4" fill="#f87171" />
                    <text x="0" y="0.5" textAnchor="middle" dominantBaseline="middle" fill="#ffffff" fontSize="10" fontWeight="600" letterSpacing="0">
                      擋修!
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        <div className="grid grid-cols-8 gap-3 px-2 pb-4">
          {coursesBySemester.map(({ sem, items }) => (
            <div key={sem.id} className="flex flex-col gap-2">
              <div className="sticky top-0 z-10 mb-1 rounded-lg bg-slate-100 py-2 text-center">
                <p className="text-xs font-bold text-slate-600">{sem.label}</p>
              </div>
              <div className="flex flex-col gap-2">
                {items.map((course) => (
                  <div 
                    key={course.id} 
                    onClick={(e) => e.stopPropagation()}
                  >
                    <CourseCard
                      course={course}
                      highlight={getHighlight(course)}
                      prereqNames={getPrereqNames(course)}
                      onHover={onHover}
                      onClick={onClick}
                      registerRef={registerRef}
                      colors={colorsMap[course.specialtyKey] ?? { card: 'bg-slate-50', border: 'border-slate-300', glow: 'shadow-slate-400/50', accent: 'text-slate-700' }}
                      isDuplicate={duplicateSpecTwoIds.has(course.id)}
                    />
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="rounded-lg border border-dashed border-slate-200 py-6 text-center">
                    <span className="text-[10px] text-slate-300">—</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}