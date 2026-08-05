import { useState } from 'react';
import { GraduationCap, AlertTriangle, Lock, CheckCircle2, StickyNote, X, Info } from 'lucide-react';
import {
  TAG_META,
  getNoticeUrlForCourse,
  type Course,
} from '../curriculum/data';

export type HighlightState = 'active' | 'prereq' | 'dependent' | 'dim' | 'none';

interface CourseCardProps {
  course: Course;
  highlight: HighlightState;
  prereqNames: string[];
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
  registerRef: (id: string, el: HTMLDivElement | null) => void;
  colors: { card: string; border: string; glow: string; accent: string };
  isDuplicate?: boolean;
}

const HIGHLIGHT_STYLES: Record<HighlightState, string> = {
  active: 'ring-2 ring-slate-900 scale-[1.03] shadow-xl z-20 brightness-105',
  prereq: 'ring-2 ring-emerald-500 shadow-lg z-10',
  dependent: 'ring-2 ring-violet-500 shadow-lg z-10',
  dim: 'opacity-30 saturate-50',
  none: '',
};

const DUP_NOTICE_URL = 'https://ipmt.site.nthu.edu.tw/p/412-1373-18241.php?Lang=zh-tw';

export default function CourseCard({
  course,
  highlight,
  prereqNames,
  onHover,
  onClick,
  registerRef,
  colors,
  isDuplicate = false,
}: CourseCardProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [showNotice, setShowNotice] = useState(false);

  // 直接使用 course.tag (它是 CourseTag 型別) 讀取對應的元資料
  const tagMeta = TAG_META[course.tag] ?? {
    label: '必修',
    className: 'bg-slate-100 text-slate-700 border-slate-300',
  };

  // 使用英文型別 'recommended' 進行比對
  const isRecommended = course.tag === 'recommended';
  const tooltipText = prereqNames.length > 0
    ? `建議先修：${prereqNames.join('、')}`
    : '無建議先修';

  const cardBg = isRecommended ? 'bg-slate-100' : colors.card;
  const cardBorder = isRecommended ? 'border-slate-300' : colors.border;
  const accentColor = isRecommended ? 'text-slate-500' : colors.accent;

  const hasRequiredPrereq = course.requiredPrereqs?.length > 0;

  const noticeUrl = getNoticeUrlForCourse(course.name);
  const hasNoticeUrl = Boolean(noticeUrl);

  return (
    <>
      <div
        ref={(el) => registerRef(course.id, el)}
        onMouseEnter={() => onHover(course.id)}
        onMouseLeave={() => onHover(null)}
        onClick={(e) => {
          if (isDuplicate) {
            e.stopPropagation();
            setShowWarning(true);
          } else if (hasNoticeUrl) {
            e.stopPropagation();
            setShowNotice(true);
          } else {
            onClick(course.id);
          }
        }}
        title={tooltipText}
        className={`group relative cursor-pointer rounded-xl border ${cardBg} ${cardBorder} p-2.5 transition-all duration-300 ease-out ${HIGHLIGHT_STYLES[highlight]} hover:shadow-md`}
      >
        {/* 同名課程警告 */}
        {isDuplicate && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowWarning(true);
            }}
            className="absolute -left-1.5 -top-1.5 z-30 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-amber-300 transition-transform hover:scale-110"
            title="一二專長同名課程請依系辦規定辦理"
          >
            <AlertTriangle className="h-3.5 w-3.5 fill-amber-400 text-black" />
          </button>
        )}

        {/* 特殊公告 */}
        {!isDuplicate && hasNoticeUrl && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowNotice(true);
            }}
            className="absolute -left-1.5 -top-1.5 z-30 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-sky-300 transition-transform hover:scale-110"
            title="查看此課程相關選修公告"
          >
            <Info className="h-3.5 w-3.5 text-sky-600" />
          </button>
        )}

        <div className="mb-1 flex items-center justify-between">
          <span className={`text-[10px] font-bold ${accentColor}`}>
            {course.credits} 學分
          </span>
          <span className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${tagMeta.className}`}>
            {tagMeta.label}
          </span>
        </div>
        <div className="flex items-start gap-1.5">
          <GraduationCap className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${accentColor}`} />
          <p className="text-xs font-semibold leading-snug text-slate-700">
            {course.name}
          </p>
        </div>

        {/* 底部資訊區塊 */}
        {(hasRequiredPrereq || (course.prereqs?.length > 0) || (course.notes && course.notes.trim() !== '')) && (
          <div className="mt-1.5 flex flex-col gap-1 border-t border-slate-200/60 pt-1.5 text-[9px]">
            {/* 擋修 */}
            {hasRequiredPrereq && (
              <span className="inline-flex items-center gap-1 font-semibold tracking-wider text-red-600">
                <Lock className="h-2.5 w-2.5 text-red-600 shrink-0" />
                擋修 {course.requiredPrereqs.length} 門
              </span>
            )}

            {/* 建議先修 */}
            {course.prereqs?.length > 0 && (() => {
              let displayCount = course.prereqs.length;
              if (hasRequiredPrereq) {
                displayCount = course.prereqs.length - course.requiredPrereqs.length;
              }
              if (displayCount <= 0) return null;

              return (
                <span className="inline-flex items-center gap-1 font-medium text-emerald-800/80">
                  <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600/70 shrink-0" />
                  建議先修 {displayCount} 門
                </span>
              );
            })()}

            {/* 備註 */}
            {course.notes && course.notes.trim() !== '' && (
              <div className="inline-flex items-start gap-1 text-slate-500">
                <StickyNote className="h-2.5 w-2.5 text-slate-400 shrink-0 mt-0.5" />
                <span className="text-slate-600 leading-tight">
                  {course.notes}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 同名課程提醒彈窗 */}
      {showWarning && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
          onClick={() => setShowWarning(false)}
        >
          <div
            className="mx-4 max-w-md animate-[fadeIn_0.2s_ease-out] rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between border-b border-orange-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 fill-amber-500 text-white" />
                <h3 className="text-base font-bold text-amber-900">同名課程提醒</h3>
              </div>
              <button
                onClick={() => setShowWarning(false)}
                className="rounded-full p-1 text-slate-400 transition-colors hover:bg-orange-50 hover:text-orange-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">
                課程名稱：{course.name}
              </p>
              <p>
                第一與第二專長包含同名課程時，修課與學分抵免請參考「科管院學士班修業注意事項」辦理：
              </p>
              <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50/80 p-3.5 border border-amber-200/80 shadow-sm">
                <span className="text-xs font-semibold text-amber-800 block mb-1">公告連結：</span>
                <a
                  href={DUP_NOTICE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-orange-700 hover:text-orange-900 font-bold underline underline-offset-2 break-all transition-colors"
                >
                  {DUP_NOTICE_URL}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 特殊課程公告資訊彈窗 (i) */}
      {showNotice && noticeUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
          onClick={() => setShowNotice(false)}
        >
          <div
            className="mx-4 max-w-md animate-[fadeIn_0.2s_ease-out] rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900">選修課程公告提醒</h3>
              </div>
              <button
                onClick={() => setShowNotice(false)}
                className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">
                {course.name}
              </p>
              <p>
                選修課程相關規定與辦理說明，請點擊下方連結前往系所公告查看：
              </p>
              <div className="rounded-xl bg-sky-50/70 p-3 border border-sky-100">
                <span className="text-xs text-slate-500 block mb-1">系所公告連結：</span>
                <a
                  href={noticeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-sky-700 hover:text-sky-900 font-medium underline underline-offset-2 break-all"
                >
                  {noticeUrl}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}