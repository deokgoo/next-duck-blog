'use client';

import { useState } from 'react';

export default function ChromeDevToolsMCPSetupModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="my-8 text-center">
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-lg bg-primary-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
        >
          🚀 설치 및 설정 방법 보기
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
              Chrome DevTools MCP 시작하기
            </h2>

            <div className="space-y-6">
              <section>
                <h3 className="mb-3 text-xl font-semibold text-primary-600 dark:text-primary-400">
                  CLI로 간편 설치
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Gemini Desktop
                    </p>
                    <pre className="overflow-x-auto rounded-lg bg-gray-100 p-3 dark:bg-gray-900">
                      <code className="text-sm text-gray-800 dark:text-gray-200">
                        gemini mcp add chrome-devtools npx chrome-devtools-mcp@latest
                      </code>
                    </pre>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Claude Desktop
                    </p>
                    <pre className="overflow-x-auto rounded-lg bg-gray-100 p-3 dark:bg-gray-900">
                      <code className="text-sm text-gray-800 dark:text-gray-200">
                        claude mcp add chrome-devtools npx chrome-devtools-mcp@latest
                      </code>
                    </pre>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-xl font-semibold text-primary-600 dark:text-primary-400">
                  첫 번째 사용
                </h3>
                <p className="mb-3 text-gray-700 dark:text-gray-300">
                  AI에게 다음과 같이 요청하면 됩니다:
                </p>
                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                  <p className="text-gray-800 dark:text-gray-200">
                    "Chrome DevTools MCP를 사용해서 example.com에 접속하고 console에 에러가 있는지
                    확인해줘"
                  </p>
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-xl font-semibold text-primary-600 dark:text-primary-400">
                  기타 CLI, IDE 설정
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Kiro, Cline, Cursor 등 다른 도구에서 사용하는 방법은{' '}
                  <a
                    href="https://github.com/ChromeDevTools/chrome-devtools-mcp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 underline hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Chrome DevTools MCP GitHub
                  </a>
                  를 참고하세요.
                </p>
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
  );
}
