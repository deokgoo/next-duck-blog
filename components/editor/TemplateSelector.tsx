import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { LayoutTemplate, X, Check, RefreshCw, MoreVertical, Trash2, Edit2, Settings } from 'lucide-react';
import { Menu } from '@headlessui/react';
import { Template } from '@/lib/db/templates';
// import { getTemplates, seedInitialTemplates } from '@/lib/db/templates'; // Legacy client-side, now moved to API
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import EditTemplateModal from './EditTemplateModal';

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (content: string) => void;
}

export default function TemplateSelector({ isOpen, onClose, onSelect }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const [error, setError] = useState<string | null>(null);
  
  // 상태: 수정 모달
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  // 확인 모달 상태
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
    isDangerous?: boolean;
    confirmText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: () => {},
    isDangerous: false,
  });

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/templates');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      setError('탬플릿을 불러오는데 실패했습니다. 서버 연결 상태를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const handleSeed = () => {
    setConfirmModal({
        isOpen: true,
        title: '기본 탬플릿 생성',
        message: '기본 탬플릿을 다시 생성하시겠습니까? (기존 데이터는 유지됩니다)',
        action: async () => {
            try {
                // Initial templates data
                const initialTemplates = [
                    {
                      name: '여행 포스트',
                      category: 'Travel',
                      description: '여행 일정, 숙소, 맛집 정보를 정리하기 좋은 탬플릿',
                      content: `# [여행지 이름] 여행기 ✈️\n\n## 📅 일정 요약\n- **기간**: 202X.XX.XX ~ 202X.XX.XX (X박 X일)\n- **숙소**: [숙소 이름]\n- **교통**: [항공편/기차 등]\n\n## DAY 1: 도착 및 첫인상\n(여기에 첫날의 여정을 기록하세요)\n\n## DAY 2: 주요 명소 탐방\n(여기에 둘째날의 여정을 기록하세요)\n\n## 🏨 숙소 후기\n- **위치**: (5점 만점에 X점)\n- **청결도**: (5점 만점에 X점)\n- **한줄평**: \n\n## 🍽️ 맛집 추천\n1. **[식당 이름]**: 대표 메뉴 ...\n2. **[카페 이름]**: 분위기 ...\n\n## 💡 여행 팁\n- 환전은 어디서?\n- 날씨와 옷차림?\n`,
                    },
                    {
                      name: '기술 블로그 (Tech)',
                      category: 'Tech',
                      description: '코드 스니펫과 설명이 포함된 기술 아티클 탬플릿',
                      content: `# [주제/기술 이름] 완벽 가이드 🚀\n\n## 개요 (Overview)\n이 포스트에서는 [기술/라이브러리]의 핵심 기능과 사용법을 다룹니다.\n\n## 🛠️ 설치 및 설정 (Installation)\n\n\`\`\`bash\nnpm install package-name\n\`\`\`\n\n## ✨ 주요 기능 (Features)\n\n### 1. 기능 A\n설명...\n\n\`\`\`typescript\nconst example = () => {\n  console.log('Hello World');\n};\n\`\`\`\n\n### 2. 기능 B\n설명...\n\n## ⚠️ 주의사항 (Gotchas)\n- 주의할 점 1\n- 주의할 점 2\n\n## 🔗 참고 자료 (References)\n- [공식 문서](https://example.com)\n`,
                    },
                    {
                      name: '맛집 탐방',
                      category: 'Food',
                      description: '음식 사진과 맛 평가를 기록하는 탬플릿',
                      content: `# [식당 이름] - [지역명] 맛집 탐방 🍽️\n\n## 📍 기본 정보\n- **주소**: [주소 입력]\n- **영업시간**: XX:XX ~ XX:XX\n- **대표 메뉴**: [메뉴 이름]\n\n## 📸 분위기 및 인테리어\n(매장 내부 사진과 분위기 설명)\n\n## 😋 메뉴 후기\n\n### [메뉴 1 이름]\n- **가격**: 00,000원\n- **맛 평가**: (맛에 대한 상세한 묘사)\n\n### [메뉴 2 이름]\n- **가격**: 00,000원\n- **맛 평가**: ...\n\n## ⭐ 총평\n- **맛**: ⭐⭐⭐⭐⭐\n- **가성비**: ⭐⭐⭐⭐\n- **재방문 의사**: 있음/없음\n`,
                    },
                ];

                await fetch('/api/templates', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(initialTemplates)
                });
                
                await fetchTemplates();
            } catch (err) {
                console.error('Failed to seed templates:', err);
                setError('탬플릿 생성에 실패했습니다.');
            }
        },
        isDangerous: false, // Not destructive as it adds
        confirmText: '생성하기',
    });
  };

  const deleteTemplate = async (id: string) => {
    try {
        const response = await fetch(`/api/templates?id=${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete');
        await fetchTemplates();
    } catch (error) {
        console.error('Failed to delete template:', error);
        alert('삭제에 실패했습니다.');
    }
  };

  const handleDeleteClick = (template: Template) => {
      setConfirmModal({
          isOpen: true,
          title: '탬플릿 삭제',
          message: `'${template.name}' 탬플릿을 삭제하시겠습니까?`,
          action: () => deleteTemplate(template.id),
          isDangerous: true,
          confirmText: '삭제',
      });
  };

  const handleUpdateTemplate = async (id: string, updates: Partial<Template>) => {
      const response = await fetch('/api/templates', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...updates }),
      });
      
      if (!response.ok) throw new Error('Failed to update');
      await fetchTemplates();
  };

  const categories = ['All', ...Array.from(new Set(templates.map((t) => t.category)))];

  const filteredTemplates =
    selectedCategory === 'All'
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  return (
    <Transition appear show={isOpen} as="div">
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as="div"
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-[90vw] max-w-7xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-900">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
                  <Dialog.Title
                    as="h3"
                    className="flex items-center text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    <LayoutTemplate className="mr-2 h-5 w-5" />
                    탬플릿 선택
                  </Dialog.Title>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={fetchTemplates}
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                      title="새로고침"
                    >
                      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                      onClick={handleSeed}
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                      title="기본 탬플릿 초기화"
                    >
                      <span className="text-xs">초기화</span>
                    </button>
                    <button
                      onClick={onClose}
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2 overflow-x-auto pb-4">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? 'bg-black text-white dark:bg-white dark:text-black'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {loading ? (
                    <p className="col-span-full py-10 text-center text-gray-500">
                      탬플릿을 불러오는 중...
                    </p>
                  ) : error ? (
                    <div className="col-span-full py-10 text-center text-red-500">
                         <p>{error}</p>
                         <button 
                            onClick={fetchTemplates}
                            className="mt-4 rounded bg-red-100 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-200"
                         >
                            다시 시도
                         </button>
                    </div>
                  ) : filteredTemplates.length === 0 ? (
                    <div className="col-span-full py-10 text-center text-gray-500">
                      <p>등록된 탬플릿이 없습니다.</p>
                      <button
                        onClick={handleSeed}
                        className="mt-2 text-sm text-blue-500 underline hover:text-blue-600"
                      >
                        기본 탬플릿 생성하기
                      </button>
                    </div>
                  ) : (
                    filteredTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="group relative flex flex-col justify-between rounded-xl border border-gray-200 bg-gray-50 p-5 transition-all hover:border-black hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-white"
                      >
                        <div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
                            <Menu as="div" className="relative inline-block text-left">
                                <Menu.Button className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200">
                                    <Settings className="h-4 w-4" />
                                </Menu.Button>
                                <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                >
                                    <Menu.Items className="absolute right-0 mt-2 w-32 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700">
                                        <div className="px-1 py-1">
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingTemplate(template);
                                                        }}
                                                        className={`${
                                                            active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                                        } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900 dark:text-gray-100`}
                                                    >
                                                        <Edit2 className="mr-2 h-4 w-4" aria-hidden="true" />
                                                        수정
                                                    </button>
                                                )}
                                            </Menu.Item>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteClick(template);
                                                        }}
                                                        className={`${
                                                            active ? 'bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-300' : 'text-gray-900 dark:text-gray-100'
                                                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                                                        삭제
                                                    </button>
                                                )}
                                            </Menu.Item>
                                        </div>
                                    </Menu.Items>
                                </Transition>
                            </Menu>
                        </div>

                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <span className="inline-block rounded bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                              {template.category}
                            </span>
                          </div>
                          <h4 className="mb-2 text-lg font-bold text-gray-900 dark:text-white pr-6">
                            {template.name}
                          </h4>
                          <p className="line-clamp-3 text-sm text-gray-500 dark:text-gray-400">
                            {template.description}
                          </p>
                        </div>
                        <button
                          onClick={() => onSelect(template.content)}
                          className="mt-4 flex w-full items-center justify-center rounded-lg bg-white py-2 text-sm font-medium text-black border border-gray-200 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          선택하기
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
      
      {/* 탬플릿 시딩 확인 모달 */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.action}
        title={confirmModal.title}
        message={confirmModal.message}
        isDangerous={confirmModal.isDangerous}
        confirmText={confirmModal.confirmText}
      />

      {/* 탬플릿 수정 모달 */}
      <EditTemplateModal
         isOpen={!!editingTemplate}
         onClose={() => setEditingTemplate(null)}
         onSave={handleUpdateTemplate}
         template={editingTemplate}
       />
    </Transition>
  );
}
