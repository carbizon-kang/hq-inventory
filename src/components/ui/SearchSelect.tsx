"use client";

import { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
}

interface SearchSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allLabel?: string;     // "전체 지사", "전체 품목" 등
  className?: string;
}

export default function SearchSelect({
  options,
  value,
  onChange,
  placeholder = "검색...",
  allLabel = "전체",
  className = "",
}: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 현재 선택된 레이블
  const selectedLabel = options.find((o) => o.value === value)?.label ?? "";

  // 쿼리로 필터
  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleOpen() {
    setOpen(true);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleSelect(val: string) {
    onChange(val);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* 트리거 버튼 */}
      <button
        type="button"
        onClick={handleOpen}
        className="flex items-center justify-between gap-2 border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 min-w-[120px] w-full text-left"
      >
        <span className={value ? "text-gray-800" : "text-gray-400"}>
          {value ? selectedLabel : allLabel}
        </span>
        <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 드롭다운 */}
      {open && (
        <div className="absolute z-50 mt-1 left-0 w-full min-w-[180px] bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {/* 검색 입력 */}
          <div className="p-2 border-b border-gray-100">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          {/* 목록 */}
          <ul className="max-h-52 overflow-y-auto py-1">
            {/* 전체 선택 */}
            <li>
              <button
                type="button"
                onClick={() => handleSelect("")}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors ${
                  !value ? "font-semibold text-blue-600" : "text-gray-600"
                }`}
              >
                {allLabel}
              </button>
            </li>
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-xs text-gray-400 text-center">검색 결과 없음</li>
            ) : (
              filtered.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors ${
                      value === opt.value ? "font-semibold text-blue-600 bg-blue-50" : "text-gray-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
