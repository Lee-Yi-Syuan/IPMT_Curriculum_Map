import { useState, useMemo, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import CurriculumGrid from './components/CurriculumGrid';
import Sidebar from './components/Sidebar';
import MascotWidget from './components/MascotWidget';
import {
  getCoursesForSpecialties,
  getSpecialtyByKey,
  DEFAULT_FIRST,
  DEFAULT_SECOND,
} from './curriculum/data';

// 補上 college_required 權重：院訂必修 (0) > 必修 (1) > 選修 (2) > 建議先修 (3)
const TAG_ORDER: Record<string, number> = { 
  college_required: 0, 
  required: 1, 
  elective: 2, 
  recommended: 3 
};

export default function App() {
  const [specOne, setSpecOne] = useState<string>(DEFAULT_FIRST);
  const [specTwo, setSpecTwo] = useState<string>(DEFAULT_SECOND);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const gridWrapperRef = useRef<HTMLDivElement>(null);

  const specialtyKeys = useMemo(() => [specOne, specTwo], [specOne, specTwo]);

  const courses = useMemo(
    () => getCoursesForSpecialties(specialtyKeys),
    [specialtyKeys]
  );

  // 排序邏輯：1. 專長順序 (一專 > 二專)  2. 類別順序 (院訂 > 必修 > 選修 > 建議)
  const sortedCourses = useMemo(() => {
    return [...courses].sort((a, b) => {
      // 1. 先比對專長 (一專排在二專前面)
      if (a.specialtyKey !== b.specialtyKey) {
        return a.specialtyKey === specOne ? -1 : 1;
      }
      // 2. 專長相同時，比對課程類別 (TAG_ORDER)
      const aWeight = TAG_ORDER[a.tag] ?? 99;
      const bWeight = TAG_ORDER[b.tag] ?? 99;
      return aWeight - bWeight;
    });
  }, [courses, specOne]);

  const activeCourse = useMemo(
    () => courses.find((c) => c.id === (activeId ?? hoverId)) ?? null,
    [courses, activeId, hoverId]
  );

  const handleSpecOneChange = useCallback((key: string) => {
    setSpecOne(key);
    setActiveId(null);
    setHoverId(null);
  }, []);

  const handleSpecTwoChange = useCallback((key: string) => {
    setSpecTwo(key);
    setActiveId(null);
    setHoverId(null);
  }, []);

  const handleDownload = useCallback(async () => {
    const node = gridWrapperRef.current;
    if (!node) return;
    setIsDownloading(true);
    setActiveId(null);
    setHoverId(null);

    const originalStyle = node.getAttribute('style') || '';
    const originalClassName = node.className;

    try {
      // 截圖 bug 修正
      node.style.width = '1400px';
      node.style.maxWidth = 'none';
      node.style.height = 'auto';
      node.style.position = 'absolute';
      node.style.left = '-9999px';
      node.style.top = '0';

      const [{ default: html2canvas }] = await Promise.all([
        import('html2canvas'),
        new Promise((r) => setTimeout(r, 200)),
      ]);

      const canvas = await html2canvas(node, {
        backgroundColor: '#f8fafc',
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 1400,
        windowHeight: node.scrollHeight,
      });

      const link = document.createElement('a');
      const specOneInfo = getSpecialtyByKey(specOne);
      const specTwoInfo = getSpecialtyByKey(specTwo);
      link.download = `課程地圖_${specOneInfo?.name ?? ''}_${specTwoInfo?.name ?? ''}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('下載失敗', err);
      alert('下載失敗，請稍後再試。');
    } finally {
      node.setAttribute('style', originalStyle);
      node.className = originalClassName;
      setIsDownloading(false);
    }
  }, [specOne, specTwo]);

  const handleClick = useCallback((id: string | null) => {
    if (id === null) {
      setActiveId(null);
    } else {
      setActiveId((prev) => (prev === id ? null : id));
    }
  }, []);

  const specOneInfo = getSpecialtyByKey(specOne);
  const specTwoInfo = getSpecialtyByKey(specTwo);

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900">
      <Navbar
        specOne={specOne}
        specTwo={specTwo}
        onSpecOneChange={handleSpecOneChange}
        onSpecTwoChange={handleSpecTwoChange}
        onDownload={handleDownload}
        isDownloading={isDownloading}
      />

      <main className="mx-auto max-w-[1600px] px-6 py-6">
        {/* Combination banner */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          {/* 第一專長 */}
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200">
            <span className="h-2.5 w-2.5 rounded-full bg-[#CA8A04]" />
            <span className="text-sm font-semibold text-slate-700">{specOneInfo?.name ?? ''}</span>
            <span className="text-[10px] text-slate-400">({specOneInfo?.typeName})</span>
          </div>
          <span className="text-lg font-light text-slate-300">+</span>
          {/* 第二專長 */}
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200">
            <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB]" />
            <span className="text-sm font-semibold text-slate-700">{specTwoInfo?.name ?? ''}</span>
            <span className="text-[10px] text-slate-400">({specTwoInfo?.typeName})</span>
          </div>
        </div>

        <div className="flex flex-col gap-5 lg:flex-row">
          <div ref={gridWrapperRef} className="flex-1">
            <CurriculumGrid
              courses={sortedCourses}
              activeId={activeId}
              hoverId={hoverId}
              onHover={setHoverId}
              onClick={handleClick}
              specialtyKeys={specialtyKeys}
            />
          </div>
          <Sidebar
            courses={courses}
            specOneKey={specOne}
            specTwoKey={specTwo}
            activeCourse={activeCourse}
          />
        </div>

        {/* 網頁頁尾 */}
        <footer className="mt-10 border-t border-slate-200 bg-white/60 py-6 text-center">
          <p className="mb-2 inline-flex items-center justify-center text-xs font-semibold leading-relaxed tracking-wide text-slate-600">
            <span>學分認列以系所公告為主，課程地圖僅供參考，請依選課情形規劃修課，如有任何問題歡迎洽詢系辦</span>
            <MascotWidget />
          </p>
          <p className="text-[11px] leading-relaxed tracking-wide text-slate-400">
            地址：300044 新竹市光復路二段101號 國立清華大學科技管理學院學士班
            ｜ 服務電話：(03)516-2102 ｜ 服務信箱：dmm@my.nthu.edu.tw
          </p>
        </footer>
      </main>
    </div>
  );
}