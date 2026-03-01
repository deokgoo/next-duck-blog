'use client';

export interface LayoutOption {
  value: string;
  label: string;
  description: string;
}

export const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    value: 'PostLayout',
    label: '기본 레이아웃',
    description: '사이드바 포함 클래식 블로그 레이아웃',
  },
  {
    value: 'PostSimple',
    label: '심플 레이아웃',
    description: '깔끔한 단일 컬럼 레이아웃',
  },
  {
    value: 'PostBanner',
    label: '배너 레이아웃',
    description: '상단 배너 이미지가 포함된 레이아웃',
  },
  {
    value: 'PostModern',
    label: '모던 레이아웃',
    description: '모던 스타일 사이드바 레이아웃',
  },
];

export interface LayoutThumbnailPickerProps {
  selectedLayout: string;
  bannerImageUrl?: string;
  onLayoutChange: (layout: string) => void;
}

function PostLayoutThumbnail() {
  return (
    <div className="flex h-full w-full flex-col gap-1 p-1.5">
      {/* 상단 제목 */}
      <div className="h-2 w-3/4 rounded-sm bg-gray-400 dark:bg-gray-500" />
      {/* 좌측 사이드바 + 우측 본문 */}
      <div className="flex flex-1 gap-1">
        <div className="flex w-1/4 flex-col gap-0.5">
          <div className="h-1.5 w-full rounded-sm bg-gray-300 dark:bg-gray-600" />
          <div className="h-1.5 w-full rounded-sm bg-gray-300 dark:bg-gray-600" />
          <div className="h-1.5 w-3/4 rounded-sm bg-gray-300 dark:bg-gray-600" />
        </div>
        <div className="flex flex-1 flex-col gap-0.5">
          <div className="h-1 w-full rounded-sm bg-gray-200 dark:bg-gray-700" />
          <div className="h-1 w-full rounded-sm bg-gray-200 dark:bg-gray-700" />
          <div className="h-1 w-5/6 rounded-sm bg-gray-200 dark:bg-gray-700" />
          <div className="h-1 w-full rounded-sm bg-gray-200 dark:bg-gray-700" />
          <div className="h-1 w-2/3 rounded-sm bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
}

function PostSimpleThumbnail() {
  return (
    <div className="flex h-full w-full flex-col gap-1 p-1.5">
      {/* 상단 날짜 */}
      <div className="h-1 w-1/4 rounded-sm bg-gray-300 dark:bg-gray-600" />
      {/* 제목 */}
      <div className="h-2 w-2/3 rounded-sm bg-gray-400 dark:bg-gray-500" />
      {/* 전체 너비 본문 */}
      <div className="flex flex-1 flex-col gap-0.5">
        <div className="h-1 w-full rounded-sm bg-gray-200 dark:bg-gray-700" />
        <div className="h-1 w-full rounded-sm bg-gray-200 dark:bg-gray-700" />
        <div className="h-1 w-5/6 rounded-sm bg-gray-200 dark:bg-gray-700" />
        <div className="h-1 w-full rounded-sm bg-gray-200 dark:bg-gray-700" />
        <div className="h-1 w-3/4 rounded-sm bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}

function PostBannerThumbnail({ bannerImageUrl }: { bannerImageUrl?: string }) {
  return (
    <div className="flex h-full w-full flex-col gap-1 p-1.5">
      {/* 상단 배너 이미지 영역 */}
      {bannerImageUrl ? (
        <div
          className="h-8 w-full rounded-sm bg-cover bg-center"
          style={{ backgroundImage: `url(${bannerImageUrl})` }}
        />
      ) : (
        <div className="flex h-8 w-full items-center justify-center rounded-sm bg-gray-300 dark:bg-gray-600">
          <svg
            className="h-3 w-3 text-gray-400 dark:text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
      {/* 제목 */}
      <div className="h-1.5 w-1/2 rounded-sm bg-gray-400 dark:bg-gray-500" />
      {/* 본문 */}
      <div className="flex flex-1 flex-col gap-0.5">
        <div className="h-1 w-full rounded-sm bg-gray-200 dark:bg-gray-700" />
        <div className="h-1 w-5/6 rounded-sm bg-gray-200 dark:bg-gray-700" />
        <div className="h-1 w-full rounded-sm bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}

function PostModernThumbnail() {
  return (
    <div className="flex h-full w-full flex-col gap-1 p-1.5">
      {/* 상단 태그 */}
      <div className="flex gap-0.5">
        <div className="h-1 w-4 rounded-sm bg-gray-300 dark:bg-gray-600" />
        <div className="h-1 w-3 rounded-sm bg-gray-300 dark:bg-gray-600" />
      </div>
      {/* 제목 */}
      <div className="h-2 w-3/4 rounded-sm bg-gray-400 dark:bg-gray-500" />
      {/* 날짜 */}
      <div className="h-1 w-1/3 rounded-sm bg-gray-300 dark:bg-gray-600" />
      {/* 좌측 본문 + 우측 사이드바 */}
      <div className="flex flex-1 gap-1">
        <div className="flex flex-1 flex-col gap-0.5">
          <div className="h-1 w-full rounded-sm bg-gray-200 dark:bg-gray-700" />
          <div className="h-1 w-full rounded-sm bg-gray-200 dark:bg-gray-700" />
          <div className="h-1 w-5/6 rounded-sm bg-gray-200 dark:bg-gray-700" />
          <div className="h-1 w-full rounded-sm bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="flex w-1/4 flex-col gap-0.5">
          <div className="h-1.5 w-full rounded-sm bg-gray-300 dark:bg-gray-600" />
          <div className="h-1.5 w-full rounded-sm bg-gray-300 dark:bg-gray-600" />
          <div className="h-1.5 w-3/4 rounded-sm bg-gray-300 dark:bg-gray-600" />
        </div>
      </div>
    </div>
  );
}

const THUMBNAIL_COMPONENTS: Record<string, React.FC<{ bannerImageUrl?: string }>> = {
  PostLayout: PostLayoutThumbnail,
  PostSimple: PostSimpleThumbnail,
  PostBanner: PostBannerThumbnail,
  PostModern: PostModernThumbnail,
};

export default function LayoutThumbnailPicker({
  selectedLayout,
  bannerImageUrl,
  onLayoutChange,
}: LayoutThumbnailPickerProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        레이아웃
      </label>
      <div className="grid grid-cols-2 gap-3">
        {LAYOUT_OPTIONS.map((option) => {
          const isSelected = selectedLayout === option.value;
          const ThumbnailComponent = THUMBNAIL_COMPONENTS[option.value];

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onLayoutChange(option.value)}
              data-layout={option.value}
              data-selected={isSelected}
              className={`group flex flex-col rounded-lg border-2 p-2 text-left transition-all ${
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-200 dark:border-blue-400 dark:ring-blue-900'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
              }`}
            >
              {/* 썸네일 미리보기 */}
              <div
                className={`mb-2 h-20 w-full rounded-md border ${
                  isSelected
                    ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
                    : 'border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                }`}
              >
                {ThumbnailComponent && (
                  <ThumbnailComponent
                    bannerImageUrl={option.value === 'PostBanner' ? bannerImageUrl : undefined}
                  />
                )}
              </div>
              {/* 레이아웃 이름 */}
              <span
                className={`text-sm font-medium ${
                  isSelected
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-gray-800 dark:text-gray-200'
                }`}
              >
                {option.label}
              </span>
              {/* 설명 */}
              <span className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
