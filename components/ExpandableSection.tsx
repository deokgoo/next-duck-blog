'use client';

import { useState, ReactNode } from 'react';

interface ExpandableSectionProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
}

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M10 12a1 1 0 01-.707-.293l-5-5a1 1 0 111.414-1.414L10 9.586l4.293-4.293a1 1 0 111.414 1.414l-5 5A1 1 0 0110 12z"
      clipRule="evenodd"
    />
  </svg>
);

const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M8.293 14.707a1 1 0 010-1.414L11.586 10 8.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

interface ExpandableSectionProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
}

const ExpandableSection = ({
  title,
  children,
  defaultExpanded = false,
}: ExpandableSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="expandable-section my-1">
      <button
        onClick={toggleExpanded}
        className="flex w-full items-center rounded p-2 text-left font-semibold transition "
      >
        {isExpanded ? (
          <ChevronDownIcon className="mr-2 h-5 w-5" />
        ) : (
          <ChevronRightIcon className="mr-2 h-5 w-5" />
        )}
        {title}
      </button>
      {isExpanded && <div className="mt-2 pl-4">{children}</div>}
    </div>
  );
};

export default ExpandableSection;
