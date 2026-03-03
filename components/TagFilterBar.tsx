'use client';

interface TagFilterBarProps {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

const activeClass = 'bg-primary-500 text-white';
const inactiveClass =
  'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700';
const baseClass = 'rounded-full px-4 py-1.5 text-sm font-medium transition-colors';

export default function TagFilterBar({ tags, selectedTag, onSelectTag }: TagFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        data-tag="null"
        className={`${baseClass} ${selectedTag === null ? activeClass : inactiveClass}`}
        onClick={() => onSelectTag(null)}
      >
        전체
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          data-tag={tag}
          className={`${baseClass} ${selectedTag === tag ? activeClass : inactiveClass}`}
          onClick={() => onSelectTag(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
