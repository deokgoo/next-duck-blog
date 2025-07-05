'use client';

import Image from './Image';

interface DoubleImageProps {
  src1: string;
  alt1: string;
  src2: string;
  alt2: string;
}

export default function DoubleImage({ src1, alt1, src2, alt2 }: DoubleImageProps) {
  return (
    <div className="my-6 grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Image
          src={src1}
          alt={alt1}
          width={800}
          height={500}
          className="h-auto w-full rounded-lg object-cover shadow-lg"
          style={{ aspectRatio: '16/10' }}
        />
        {alt1 && <p className="text-center text-sm text-gray-600 dark:text-gray-400">{alt1}</p>}
      </div>
      <div className="space-y-2">
        <Image
          src={src2}
          alt={alt2}
          width={800}
          height={500}
          className="h-auto w-full rounded-lg object-cover shadow-lg"
          style={{ aspectRatio: '16/10' }}
        />
        {alt2 && <p className="text-center text-sm text-gray-600 dark:text-gray-400">{alt2}</p>}
      </div>
    </div>
  );
}
