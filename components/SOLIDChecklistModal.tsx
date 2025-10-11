'use client'

import { useState } from 'react'

export default function SOLIDChecklistModal() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className="my-8 text-center">
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-lg bg-primary-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
        >
          📋 SOLID 체크리스트 보기
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-8 shadow-xl dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-3xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ×
            </button>

            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
              프론트엔드 개발자를 위한 SOLID 체크리스트
            </h2>

            <div className="space-y-6">
              <section>
                <h3 className="mb-3 text-xl font-semibold text-primary-600 dark:text-primary-400">
                  ✅ SRP 체크리스트
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="mr-2">□</span>
                    <span>하나의 컴포넌트에 API 호출, 상태 관리, UI 렌더링이 모두 있지 않은가?</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">□</span>
                    <span>커스텀 훅으로 로직을 분리할 수 있는가?</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">□</span>
                    <span>유틸리티 함수를 별도 파일로 분리했는가?</span>
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="mb-3 text-xl font-semibold text-primary-600 dark:text-primary-400">
                  ✅ OCP 체크리스트
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="mr-2">□</span>
                    <span>새로운 기능 추가 시 기존 코드를 수정하지 않아도 되는가?</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">□</span>
                    <span>컴포넌트 합성(Composition)을 활용하고 있는가?</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">□</span>
                    <span>조건문 대신 전략 패턴을 사용할 수 있는가?</span>
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="mb-3 text-xl font-semibold text-primary-600 dark:text-primary-400">
                  ✅ LSP 체크리스트
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="mr-2">□</span>
                    <span>같은 인터페이스를 구현한 컴포넌트들이 교체 가능한가?</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">□</span>
                    <span>Props 타입이 일관성 있게 정의되어 있는가?</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">□</span>
                    <span>에러 처리가 모든 구현체에서 일관적인가?</span>
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="mb-3 text-xl font-semibold text-primary-600 dark:text-primary-400">
                  ✅ ISP 체크리스트
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="mr-2">□</span>
                    <span>Props가 과도하게 많지 않은가?</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">□</span>
                    <span>Pick이나 Omit으로 필요한 타입만 선택하고 있는가?</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">□</span>
                    <span>하나의 거대한 Context 대신 용도별 Context로 분리했는가?</span>
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="mb-3 text-xl font-semibold text-primary-600 dark:text-primary-400">
                  ✅ DIP 체크리스트
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="mr-2">□</span>
                    <span>API 호출이 직접 컴포넌트에 하드코딩되어 있지 않은가?</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">□</span>
                    <span>Context나 Props로 의존성을 주입하고 있는가?</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">□</span>
                    <span>Mock 객체로 테스트하기 쉬운 구조인가?</span>
                  </li>
                </ul>
              </section>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg bg-gray-200 px-6 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
