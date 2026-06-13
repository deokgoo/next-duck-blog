'use client';

import React, { useState } from 'react';

type TranslationLocale = 'en' | 'jp';
type LocaleTranslation = { title: string; summary: string };
type Translations = { en?: LocaleTranslation; jp?: LocaleTranslation };

interface TranslationTabPanelProps {
  translations: Translations | undefined;
  onChange: (translations: Translations) => void;
}

const LOCALES: { key: TranslationLocale; label: string }[] = [
  { key: 'en', label: 'EN' },
  { key: 'jp', label: 'JP' },
];

export default function TranslationTabPanel({ translations, onChange }: TranslationTabPanelProps) {
  const [activeLocale, setActiveLocale] = useState<TranslationLocale>('en');

  const currentTranslation = translations?.[activeLocale] ?? { title: '', summary: '' };

  const handleFieldChange = (field: keyof LocaleTranslation, value: string) => {
    const updated = { ...currentTranslation, [field]: value };

    // 두 필드 모두 빈 문자열이면 해당 locale 키 제거
    if (!updated.title.trim() && !updated.summary.trim()) {
      const next = { ...translations };
      delete next[activeLocale];
      onChange(next);
    } else {
      onChange({
        ...translations,
        [activeLocale]: updated,
      });
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      {/* 패널 헤더 */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">번역 (Translations)</h3>

        {/* 탭 버튼 */}
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          {LOCALES.map(({ key, label }) => {
            const hasContent = !!(translations?.[key]?.title || translations?.[key]?.summary);
            return (
              <button
                key={key}
                onClick={() => setActiveLocale(key)}
                className={`relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                  activeLocale === key
                    ? 'bg-white text-black shadow-sm dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {label}
                {hasContent && (
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" title="번역 있음" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="space-y-4 p-4">
        {/* Title */}
        <div>
          <label
            htmlFor={`translation-title-${activeLocale}`}
            className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400"
          >
            Title <span className="text-slate-400 dark:text-slate-500">({activeLocale.toUpperCase()})</span>
          </label>
          <input
            id={`translation-title-${activeLocale}`}
            type="text"
            value={currentTranslation.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            placeholder={activeLocale === 'en' ? 'English title...' : '日本語タイトル...'}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-slate-400 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-slate-500 dark:focus:bg-slate-900"
          />
        </div>

        {/* Summary */}
        <div>
          <label
            htmlFor={`translation-summary-${activeLocale}`}
            className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400"
          >
            Summary <span className="text-slate-400 dark:text-slate-500">({activeLocale.toUpperCase()})</span>
          </label>
          <textarea
            id={`translation-summary-${activeLocale}`}
            value={currentTranslation.summary}
            onChange={(e) => handleFieldChange('summary', e.target.value)}
            placeholder={activeLocale === 'en' ? 'English summary...' : '日本語のサマリー...'}
            rows={3}
            className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-slate-400 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-slate-500 dark:focus:bg-slate-900"
          />
        </div>

        {/* 빈 번역 안내 */}
        {!currentTranslation.title && !currentTranslation.summary && (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            두 필드를 모두 비워두면 해당 locale 번역이 저장되지 않습니다.
          </p>
        )}
      </div>
    </div>
  );
}
