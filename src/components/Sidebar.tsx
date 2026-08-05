import { BookOpen, Layers, Lock, Compass } from 'lucide-react';
import {
  getSpecialtyByKey,
  getSpecialtyColor,
  TAG_META,
  type Course,
} from '../curriculum/data';
import {
  UNIVERSITY_REQUIRED_CREDITS,
  COLLEGE_REQUIRED_CREDITS,
  SPECIALTY_REQUIREMENTS,
} from '../curriculum/specialtyRequirements';

interface SidebarProps {
  courses: Course[];
  specOneKey: string;
  specTwoKey: string;
  activeCourse: Course | null;
}

export default function Sidebar({ courses, specOneKey, specTwoKey, activeCourse }: SidebarProps) {
  // 1. 取得專長資訊與其對應的課程卡片色彩
  const specOne = getSpecialtyByKey(specOneKey);
  const specTwo = getSpecialtyByKey(specTwoKey);

  const specOneColor = getSpecialtyColor(specOneKey, true);  // 一專動態色彩 (暖色系)
  const specTwoColor = getSpecialtyColor(specTwoKey, false); // 二專動態色彩 (冷色系)

  // 2. 自動合成組合鍵（例如："計量財務金融_一專" 與 "資訊工程_二專"）
  const specOneReqKey = specOne ? `${specOne.name}_一專` : '';
  const specTwoReqKey = specTwo ? `${specTwo.name}_二專` : '';

  const specOneReq = SPECIALTY_REQUIREMENTS[specOneReqKey];
  const specTwoReq = SPECIALTY_REQUIREMENTS[specTwoReqKey];

  // 3. 計算學分總和
  const universityCredits = UNIVERSITY_REQUIRED_CREDITS;
  const collegeCredits = COLLEGE_REQUIRED_CREDITS;
  const specOneReqCredits = specOneReq?.requiredCredits ?? 0;
  const specOneElecCredits = specOneReq?.electiveCredits ?? 0;
  const specTwoReqCredits = specTwoReq?.requiredCredits ?? 0;
  const specTwoElecCredits = specTwoReq?.electiveCredits ?? 0;

  // 必修學分 = 校定必修 + 院訂必修 + 第一專長必修 + 第二專長必修
  const calculatedRequiredCredits =
    universityCredits + collegeCredits + specOneReqCredits + specTwoReqCredits;

  // 專長與必修小計（校定 + 院訂 + 一專必選 + 二專必選）
  const subtotalCredits =
    universityCredits +
    collegeCredits +
    (specOneReqCredits + specOneElecCredits) +
    (specTwoReqCredits + specTwoElecCredits);

  // 自由選修 = 128 - 目前計算的小計（若小計超過128則顯示0）
  const freeElectiveCredits = Math.max(0, 128 - subtotalCredits);

  // 總學分固定 128
  const totalGraduationCredits = 128;

  return (
    <aside className="flex w-full flex-col gap-4 lg:w-72">
      {/* 課程資訊 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-bold text-slate-700">課程資訊</h3>
        </div>
        {activeCourse ? (
          <div className="animate-[fadeIn_0.2s_ease-out]">
            <p className="text-base font-bold text-slate-900">{activeCourse.name}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className={`rounded border px-2 py-0.5 text-[11px] font-semibold ${TAG_META[activeCourse.tag].className}`}>
                {TAG_META[activeCourse.tag].label}
              </span>
              <span className="text-xs text-slate-500">{activeCourse.credits} 學分</span>
            </div>
            <div className="mt-3 border-t border-slate-100 pt-3 space-y-3">
              {activeCourse.requiredPrereqs.length > 0 && (
                <div>
                  <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-red-500">
                    <Lock className="h-3 w-3" />
                    擋修課程
                  </p>
                  <ul className="mt-1 space-y-1">
                    {activeCourse.requiredPrereqs.map((pid) => {
                      const pre = courses.find((c) => c.id === pid);
                      return pre ? (
                        <li key={pid} className="flex items-center gap-1.5 text-xs text-red-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          {pre.name}
                        </li>
                      ) : null;
                    })}
                  </ul>
                </div>
              )}
              {(() => {
                const reqNames = activeCourse.requiredPrereqs
                  .map((pid) => courses.find((c) => c.id === pid)?.name)
                  .filter((name): name is string => name !== undefined);
                const filteredPrereqs = activeCourse.prereqs
                  .map((pid) => courses.find((c) => c.id === pid))
                  .filter((pre): pre is Course => pre !== undefined && !reqNames.includes(pre.name));
                if (filteredPrereqs.length === 0) {
                  if (activeCourse.requiredPrereqs.length === 0) {
                    return (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">建議先修</p>
                        <p className="mt-1 text-xs text-slate-400">無建議先修課程</p>
                      </div>
                    );
                  }
                  return null;
                }
                return (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">建議先修</p>
                    <ul className="mt-1 space-y-1">
                      {filteredPrereqs.map((pre) => (
                        <li key={pre.id} className="flex items-center gap-1.5 text-xs text-slate-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {pre.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400">點擊或懸停任一課程卡片查看詳細資訊與先修關係</p>
        )}
      </div>

      {/* 連線圖例 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-bold text-slate-700">連線圖例</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-6 rounded-full bg-red-400" />
            <span className="text-xs text-slate-600">擋修</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-6 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-600">建議先修</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-6 rounded-full bg-violet-500" />
            <span className="text-xs text-slate-600">後續課程</span>
          </div>
          <p className="pt-1 text-[10px] text-slate-400">箭頭沿線條流動表示先修方向</p>
        </div>
      </div>

      {/* 學分統計 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-bold text-slate-700">學分統計</h3>
        </div>
        
        {/* 上方必修 / 總學分 方塊 */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">必修學分</p>
            <p className="mt-1 text-2xl font-bold text-slate-800">{calculatedRequiredCredits}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">總學分</p>
            <p className="mt-1 text-2xl font-bold text-slate-800">{totalGraduationCredits}</p>
          </div>
        </div>

        <div className="mt-3 space-y-1.5">
          {/* 校定必修 */}
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 border border-slate-100">
            <span className="text-xs font-semibold text-slate-700">校定必修</span>
            <span className="text-xs font-bold text-slate-600">{universityCredits} 學分</span>
          </div>

          {/* 院訂必修：改為與課程卡片「院訂」標籤對齊的咖啡/琥珀色系 */}
          <div className="flex items-center justify-between rounded-xl bg-orange-50/60 px-3 py-2 border border-orange-100/60">
            <span className="text-xs font-semibold text-orange-800/80">院訂必修</span>
            <span className="text-xs font-bold text-orange-700/80">{collegeCredits} 學分</span>
          </div>

          {/* 第一專長：色彩與課程卡片完全一致 */}
          <div className={`flex items-center justify-between rounded-xl px-3 py-2 border ${specOneColor.card} ${specOneColor.border}`}>
            <span className={`text-xs font-bold ${specOneColor.accent}`}>{specOne?.name ?? ''}</span>
            <span className={`text-xs font-bold ${specOneColor.accent}`}>
              必修 {specOneReqCredits} 學分｜選修 {specOneElecCredits} 學分
            </span>
          </div>

          {/* 第二專長：色彩與課程卡片完全一致 */}
          <div className={`flex items-center justify-between rounded-xl px-3 py-2 border ${specTwoColor.card} ${specTwoColor.border}`}>
            <span className={`text-xs font-bold ${specTwoColor.accent}`}>{specTwo?.name ?? ''}</span>
            <span className={`text-xs font-bold ${specTwoColor.accent}`}>
              必修 {specTwoReqCredits} 學分｜選修 {specTwoElecCredits} 學分
            </span>
          </div>

          {/* 自由選修：改為灰色系 */}
          <div className="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2 border border-slate-200">
            <span className="text-xs font-semibold text-slate-700">自由選修</span>
            <span className="text-xs font-bold text-slate-700">{freeElectiveCredits} 學分</span>
          </div>
        </div>
      </div>

      {/* 選課與修課指引 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Compass className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-bold text-slate-700">選課與修課指引</h3>
        </div>
        <p className="text-[10px] text-slate-400 mb-2">建議搭配校方專長資訊進行選課規劃</p>
        <ul className="space-y-2 text-xs">
          <li>
            <a href="https://curricul.site.nthu.edu.tw/p/406-1208-306079,r7893.php?Lang=zh-tw" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline transition-colors block">
              115上學期選課時程
            </a>
          </li>
          <li>
            <a href="https://ipmt.site.nthu.edu.tw/p/412-1373-18241.php?Lang=zh-tw" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline transition-colors block">
              科管院學士班修課注意事項
            </a>
          </li>
          <li>
            <a href="https://ipmt.site.nthu.edu.tw/p/412-1373-12076.php?Lang=zh-tw" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline transition-colors block">
              科管院學士班課程規劃
            </a>
          </li>
          <li>
            <a href="https://registra.site.nthu.edu.tw/p/406-1211-290177,r9255.php?Lang=zh-tw" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline transition-colors block">
              註冊組專長課程表
            </a>
          </li>
          <li>
            <a href="https://curricul.site.nthu.edu.tw/p/404-1208-165674.php?Lang=zh-tw" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline transition-colors block">
              課務組擋修課程總表
            </a>
          </li>
          <li>
            <a href="https://curricul.site.nthu.edu.tw/p/406-1208-290365,r7880.php?Lang=zh-tw" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline transition-colors block">
              課務組課程查詢系統
            </a>
          </li>
        </ul>
      </div>
    </aside>
  );
}