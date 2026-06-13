'use client';

import React, { useState } from 'react';
import { Plus, X, Globe } from 'lucide-react';

type TranslationLocale = 'en' | 'jp';
type LocaleTranslation = { title: string; summary: string; content?: string };
type Translations = { en?: LocaleTranslation; jp?: LocaleTranslation };

interface TranslationTabPanelProps {
  translations: Translations | undefined;
  onChange: (translations: Translations) => void;
}

const ALL_LOCALES: { key: TranslationLocale; label: string; flag: string }[] = [
  { key: 'en', label: 'English', flag: '🇺🇸' },
  { key: 'jp', label: '日本語', flag: '🇯🇵' },
];

export default function TranslationTabPanel({ translations, onChange }: TranslationTabPanelProps) {
  const [activeLocale, setActiveLocale] = useState<TranslationLocale | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  // 현재 활성화된(데이터 있는) locale 목록
  const activeLocales = ALL_LOCALES.filter((l) => !!translations?.[l.key]);

  // activeLocale이 없거나 삭제된 경우 첫 번째 active로 fallback
  const currentLocale =
    activeLocale && translations?.[activeLocale] ? activeLocale : activeLocales[0]?.key || null;

  const currentTranslation = currentLocale
    ? translations?.[currentLocale] ?? { title: '', summary: '', content: '' }
    : null;

  // 사용 가능한(아직 추가 안 된) locale 목록
  const availableLocales = ALL_LOCALES.filter((l) => !translations?.[l.key]);

  const handleAddLocale = (locale: TranslationLocale) => {
    onChange({
      ...translations,
      [locale]: { title: '', summary: '', content: '' },
    });
    setActiveLocale(locale);
    setShowAddMenu(false);
  };

  const handleRemoveLocale = (locale: TranslationLocale) => {
    if (!confirm(`${ALL_LOCALES.find((l) => l.key === locale)?.label} 번역을 삭제하시겠습니까?`)) return;
    const next = { ...translations };
    delete next[locale];
    onChange(next);
    // 삭제 후 다른 탭이 있으면 이동, 없으면 null
    const remaining = ALL_LOCALES.filter((l) => !!next[l.key]);
    setActiveLocale(remaining[0]?.key || null);
  };

  const handleFieldChange = (field: keyof LocaleTranslation, value: string) => {
    if (!currentLocale) return;
    onChange({
      ...translations,
      [currentLocale]: {
        ...currentTranslation,
        [field]: value,
      },
    });
  };

  // 활성 locale이 하나도 없으면 추가 버튼만 표시
  if (activeLocales.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-6 dark:border-slate-700 dark:bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Globe className="h-4 w-4" />
            <span>번역이 없습니다</span>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="flex items-center gap-1.5 rounded-lg bg-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            >
              <Plus className="h-3.5 w-3.5" />
              언어 추가
            </button>
            {showAddMenu && (
              <div className="absolute right-0 top-full z-10 mt-1 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                {ALL_LOCALES.map(({ key, label, flag }) => (
                  <button
                    key={key}
                    onClick={() => handleAddLocale(key)}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <span>{flag}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      {/* 헤더: 탭 + 추가 버튼 */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">번역</h3>
        </div>

        <div className="flex items-center gap-2">
          {/* 활성 locale 탭 */}
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            {activeLocales.map(({ key, label, flag }) => (
              <div key={key} className="flex items-center">
                <button
                  onClick={() => setActiveLocale(key)}
                  className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                    currentLocale === key
                      ? 'bg-white text-black shadow-sm dark:bg-slate-700 dark:text-white'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <span className="text-xs">{flag}</span>
                  {label}
                </button>
                {currentLocale === key && (
                  <button
                    onClick={() => handleRemoveLocale(key)}
                    className="ml-0.5 rounded p-0.5 text-slate-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30"
                    title={`${label} 번역 삭제`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* 추가 가능한 locale이 남아 있을 때만 표시 */}
          {availableLocales.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-300"
              >
                <Plus className="h-3 w-3" />
              </button>
              {showAddMenu && (
                <div className="absolute right-0 top-full z-10 mt-1 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                  {availableLocales.map(({ key, label, flag }) => (
                    <button
                      key={key}
                      onClick={() => handleAddLocale(key)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <span>{flag}</span>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      {currentLocale && currentTranslation && (
        <div className="space-y-4 p-4">
          {/* Title */}
          <div>
            <label
              htmlFor={`translation-title-${currentLocale}`}
              className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              Title
            </label>
            <input
              id={`translation-title-${currentLocale}`}
              type="text"
              value={currentTranslation.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder={currentLocale === 'en' ? 'English title...' : '日本語タイトル...'}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-slate-400 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-slate-500 dark:focus:bg-slate-900"
            />
          </div>

          {/* Summary */}
          <div>
            <label
              htmlFor={`translation-summary-${currentLocale}`}
              className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              Summary
            </label>
            <textarea
              id={`translation-summary-${currentLocale}`}
              value={currentTranslation.summary}
              onChange={(e) => handleFieldChange('summary', e.target.value)}
              placeholder={currentLocale === 'en' ? 'English summary...' : '日本語のサマリー...'}
              rows={2}
              className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-slate-400 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-slate-500 dark:focus:bg-slate-900"
            />
          </div>

          {/* Content (MDX 에디터) */}
          <div>
            <label
              htmlFor={`translation-content-${currentLocale}`}
              className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              Content{' '}
              <span className="text-slate-400 dark:text-slate-500">
                (비어있으면 한국어 원문 표시)
              </span>
            </label>
            <textarea
              id={`translation-content-${currentLocale}`}
              value={currentTranslation.content || ''}
              onChange={(e) => handleFieldChange('content', e.target.value)}
              placeholder={
                currentLocale === 'en'
                  ? 'English content (Markdown)... Leave empty to use Korean original.'
                  : '日本語コンテンツ (Markdown)... 空欄の場合は韓国語原文を表示します。'
              }
              rows={12}
              className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-slate-400 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-slate-500 dark:focus:bg-slate-900"
            />
          </div>
        </div>
      )}
    </div>
  );
}
