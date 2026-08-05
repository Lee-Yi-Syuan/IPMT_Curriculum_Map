import { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, X } from 'lucide-react';
import {
  FIRST_SPECIALTY_OPTIONS,
  SECOND_SPECIALTY_OPTIONS,
  getSpecialtyByKey,
  type Specialty,
} from '../curriculum/data';

interface NavbarProps {
  specOne: string;
  specTwo: string;
  onSpecOneChange: (key: string) => void;
  onSpecTwoChange: (key: string) => void;
  onDownload: () => void;
  isDownloading: boolean;
}

const ACCENT_MAP: Record<'gold' | 'navy', { dot: string; ring: string }> = {
  gold: { dot: 'bg-[#CA8A04]', ring: 'focus:ring-[#CA8A04]/40' },
  navy: { dot: 'bg-[#2563EB]', ring: 'focus:ring-[#2563EB]/40' },
};

function SpecialtySelect({
  label,
  value,
  options,
  accent,
  otherSelectedName,
  otherLabel,
  onChange,
  onShowWarning,
}: {
  label: string;
  value: string;
  options: Specialty[];
  accent: 'gold' | 'navy';
  otherSelectedName?: string;
  otherLabel?: string;
  onChange: (key: string) => void;
  onShowWarning: () => void;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const a = ACCENT_MAP[accent];
  const selected = getSpecialtyByKey(value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (opt: Specialty) => {
    const isSameName =
      Boolean(otherSelectedName) &&
      Boolean(opt.name) &&
      opt.name.trim() === otherSelectedName?.trim();

    if (isSameName) {
      onShowWarning();
      setOpen(false);
      return;
    }

    onChange(opt.key);
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex min-w-[170px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 ${a.ring}`}
      >
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${a.dot}`} />
        <span className="flex-1 text-left">{selected?.name ?? '—'}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 max-h-72 w-[200px] min-w-full animate-[fadeIn_0.15s_ease-out] overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
          {options.map((opt) => {
            const isSameName =
              Boolean(otherSelectedName) &&
              Boolean(opt.name) &&
              opt.name.trim() === otherSelectedName?.trim();

            return (
              <button
                key={opt.key}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(opt);
                }}
                className={`flex w-full items-start gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                  isSameName
                    ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                    : opt.key === value
                    ? 'bg-slate-50 font-semibold text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${isSameName ? 'bg-slate-300' : a.dot}`} />
                <div className="flex flex-1 flex-col">
                  <span className="leading-snug">{opt.name}</span>
                  {isSameName && (
                    <span className="mt-0.5 block text-[10px] font-normal leading-tight text-slate-400">
                      已選為{otherLabel}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Navbar({
  specOne,
  specTwo,
  onSpecOneChange,
  onSpecTwoChange,
  onDownload,
  isDownloading,
}: NavbarProps) {
  const [showAlert, setShowAlert] = useState(false);

  const specOneObj = getSpecialtyByKey(specOne);
  const specTwoObj = getSpecialtyByKey(specTwo);

  const handleSpecOneChange = (key: string) => {
    const targetObj = getSpecialtyByKey(key);
    if (targetObj && specTwoObj && targetObj.name === specTwoObj.name) {
      setShowAlert(true);
      return;
    }
    onSpecOneChange(key);
  };

  const handleSpecTwoChange = (key: string) => {
    const targetObj = getSpecialtyByKey(key);
    if (targetObj && specOneObj && targetObj.name === specOneObj.name) {
      setShowAlert(true);
      return;
    }
    onSpecTwoChange(key);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-4 px-6 py-3">
          <div className="flex items-center gap-2.5">
            <img src="/icon.jpg" alt="IPMT Logo" className="h-9 w-9 shrink-0 rounded-xl border border-slate-900 object-cover shadow-md" />
            <div>
              <h1 className="text-base font-bold leading-tight text-slate-900">清大科管院學士班課程地圖</h1>
              <p className="text-[11px] text-slate-400">IPMT Curriculum Map</p>
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <SpecialtySelect
              label="第一專長"
              value={specOne}
              options={FIRST_SPECIALTY_OPTIONS}
              accent="gold"
              otherSelectedName={specTwoObj?.name}
              otherLabel="第二專長"
              onChange={handleSpecOneChange}
              onShowWarning={() => setShowAlert(true)}
            />
            <div className="pb-2 text-lg font-light text-slate-300">+</div>
            <SpecialtySelect
              label="第二專長"
              value={specTwo}
              options={SECOND_SPECIALTY_OPTIONS}
              accent="navy"
              otherSelectedName={specOneObj?.name}
              otherLabel="第一專長"
              onChange={handleSpecTwoChange}
              onShowWarning={() => setShowAlert(true)}
            />
          </div>

          <button
            type="button"
            onClick={onDownload}
            disabled={isDownloading}
            className="ml-auto flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-slate-800 hover:shadow-lg active:scale-95 disabled:cursor-wait disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {isDownloading ? '下載中…' : '下載課程地圖'}
          </button>
        </div>
      </header>

      {/* 無底色、尺寸加大的怪獸 Modal */}
      {showAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl transition-all">
            <button
              onClick={() => setShowAlert(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex flex-col items-center text-center">
              {/* 移除背景底色，尺寸加大至 h-24 w-24 */}
              <div className="mb-2 flex h-24 w-24 items-center justify-center">
                <img
                  src="/angry_monster.PNG"
                  alt="Angry Monster"
                  className="h-full w-full object-contain drop-shadow-md"
                />
              </div>
              <h3 className="text-base font-bold text-slate-900">專長選擇重複</h3>
              <p className="mt-1 text-sm text-slate-500">
                第一專長與第二專長無法選擇相同學程，請重新選擇。
              </p>
              <button
                type="button"
                onClick={() => setShowAlert(false)}
                className="mt-5 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-slate-800 active:scale-95"
              >
                返回選擇
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}