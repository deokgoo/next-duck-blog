'use client'

import { ReactNode } from 'react'

interface CodeComparisonProps {
  children: ReactNode
}

export default function CodeComparison({ children }: CodeComparisonProps) {
  const childArray = Array.isArray(children) ? children : [children]

  // 첫 번째는 나쁜 예, 두 번째는 좋은 예
  const badCode = childArray[0]
  const goodCode = childArray[1]

  return (
    <div className="my-6 space-y-4">
      {/* 나쁜 예 */}
      <div className="rounded-lg border-2 border-red-300 dark:border-red-800">
        <div className="bg-red-100 px-4 py-2 font-semibold text-red-800 dark:bg-red-900 dark:text-red-200">
          ❌ 나쁜 예
        </div>
        <div className="overflow-x-auto">{badCode}</div>
      </div>

      {/* 좋은 예 */}
      <div className="rounded-lg border-2 border-green-300 dark:border-green-800">
        <div className="bg-green-100 px-4 py-2 font-semibold text-green-800 dark:bg-green-900 dark:text-green-200">
          ✅ 좋은 예
        </div>
        <div className="overflow-x-auto">{goodCode}</div>
      </div>
    </div>
  )
}
