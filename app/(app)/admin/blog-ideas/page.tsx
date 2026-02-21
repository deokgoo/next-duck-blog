'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import PageTitle from '@/components/PageTitle';

interface BlogIdea {
  id: string;
  title: string;
  category: string;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  status: 'planned' | 'draft' | 'writing' | 'completed';
  description: string;
  createdAt: string;
}

const priorityColors = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

const statusColors = {
  planned: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  draft: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  writing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

export default function BlogIdeasPage() {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState<BlogIdea[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newIdea, setNewIdea] = useState({
    title: '',
    category: 'web',
    tags: '',
    priority: 'medium' as const,
    description: '',
  });

  const getHeaders = async () => {
    const token = await user?.getIdToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchIdeas = async () => {
    try {
      const headers = await getHeaders();
      const response = await fetch('/api/blog-ideas', { headers });
      if (response.ok) {
        const data = await response.json();
        setIdeas(data.ideas || []);
      }
    } catch (error) {
      console.error('아이디어 로드 실패:', error);
    }
  };

  useEffect(() => {
    document.title = '블로그 아이디어 | Admin';
    if (user) {
      fetchIdeas();
    }
  }, [user]);

  const addIdea = async () => {
    if (!newIdea.title.trim()) return;

    const idea = {
      ...newIdea,
      tags: newIdea.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      status: 'planned' as const,
    };

    try {
      const headers = await getHeaders();
      const response = await fetch('/api/blog-ideas', {
        method: 'POST',
        headers,
        body: JSON.stringify(idea),
      });

      if (response.ok) {
        fetchIdeas();
        setNewIdea({ title: '', category: 'web', tags: '', priority: 'medium', description: '' });
      }
    } catch (error) {
      console.error('아이디어 추가 실패:', error);
    }
  };

  const updateIdea = async (id: string, updates: Partial<BlogIdea>) => {
    try {
      const headers = await getHeaders();
      await fetch('/api/blog-ideas', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ id, ...updates }),
      });
      fetchIdeas();
      setEditingId(null);
    } catch (error) {
      console.error('아이디어 업데이트 실패:', error);
    }
  };

  const deleteIdea = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const headers = await getHeaders();
      await fetch('/api/blog-ideas', {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ id }),
      });
      fetchIdeas();
    } catch (error) {
      console.error('아이디어 삭제 실패:', error);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 xl:px-8">
      <div className="space-y-6 pt-6 pb-8 md:space-y-12">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4">
          <PageTitle>블로그 아이디어</PageTitle>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 새 아이디어 추가 폼 */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 h-fit sticky top-24">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">아이디어 구상</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">제목</label>
                <input
                  type="text"
                  placeholder="새로운 포스트 아이디어..."
                  value={newIdea.title}
                  onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">카테고리</label>
                  <select
                    value={newIdea.category}
                    onChange={(e) => setNewIdea({ ...newIdea, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                  >
                    <option value="web">Web</option>
                    <option value="react">React</option>
                    <option value="nextjs">Next.js</option>
                    <option value="js">JavaScript</option>
                    <option value="algorithm">Algorithm</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">우선순위</label>
                  <select
                    value={newIdea.priority}
                    onChange={(e) => setNewIdea({ ...newIdea, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">태그</label>
                <input
                  type="text"
                  placeholder="태그 (쉼표로 구분)"
                  value={newIdea.tags}
                  onChange={(e) => setNewIdea({ ...newIdea, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">설명</label>
                <textarea
                  placeholder="간단한 메모나 설명을 적어두세요."
                  value={newIdea.description}
                  onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 transition-all outline-none resize-y"
                  rows={4}
                />
              </div>

              <button
                onClick={addIdea}
                className="w-full mt-2 py-2.5 bg-black text-white dark:bg-white dark:text-black font-bold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg active:scale-95"
              >
                아이디어 저장
              </button>
            </div>
          </div>

          {/* 아이디어 리스트 */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              아이디어 목록
              <span className="text-sm font-normal bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-gray-500">
                {ideas.length}
              </span>
            </h2>
            
            {ideas.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 border-dashed">
                <p className="text-gray-500 dark:text-gray-400">등록된 아이디어가 없습니다.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-1">
                {ideas.map((idea) => (
                  <div key={idea.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md">
                    {editingId === idea.id ? (
                      <EditForm idea={idea} onSave={updateIdea} onCancel={() => setEditingId(null)} />
                    ) : (
                      <ViewMode
                        idea={idea}
                        onEdit={() => setEditingId(idea.id)}
                        onDelete={() => deleteIdea(idea.id)}
                        onStatusChange={(status) => updateIdea(idea.id, { status })}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ViewMode({
  idea,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  idea: BlogIdea;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: BlogIdea['status']) => void;
}) {
  return (
    <>
      <div className="flex justify-between items-start mb-3 gap-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{idea.title}</h3>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={onEdit} className="text-xs font-semibold text-gray-500 hover:text-blue-500 transition-colors">
            수정
          </button>
          <button onClick={onDelete} className="text-xs font-semibold text-gray-500 hover:text-red-500 transition-colors">
            삭제
          </button>
        </div>
      </div>
      
      {idea.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 whitespace-pre-wrap">{idea.description}</p>
      )}
      
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${priorityColors[idea.priority]}`}>
          {idea.priority}
        </span>
        <select
          value={idea.status}
          onChange={(e) => onStatusChange(e.target.value as BlogIdea['status'])}
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border-0 cursor-pointer appearance-none ${statusColors[idea.status]}`}
        >
          <option value="planned">Planned</option>
          <option value="draft">Draft</option>
          <option value="writing">Writing</option>
          <option value="completed">Completed</option>
        </select>
        {idea.tags.map((tag) => (
          <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-[10px] uppercase font-bold tracking-wider">
            {tag}
          </span>
        ))}
      </div>
      
      <div className="text-xs text-gray-400 font-medium flex items-center justify-between">
        <span>카테고리: {idea.category}</span>
        <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
      </div>
    </>
  );
}

function EditForm({
  idea,
  onSave,
  onCancel,
}: {
  idea: BlogIdea;
  onSave: (id: string, updates: Partial<BlogIdea>) => void;
  onCancel: () => void;
}) {
  const [editData, setEditData] = useState({
    title: idea.title,
    category: idea.category,
    tags: idea.tags.join(', '),
    priority: idea.priority,
    description: idea.description,
  });

  const handleSave = () => {
    onSave(idea.id, {
      ...editData,
      tags: editData.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    });
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={editData.title}
        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 text-sm font-medium"
      />
      <div className="grid grid-cols-2 gap-3">
        <select
          value={editData.category}
          onChange={(e) => setEditData({ ...editData, category: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 text-sm"
        >
          <option value="web">Web</option>
          <option value="react">React</option>
          <option value="nextjs">Next.js</option>
          <option value="js">JavaScript</option>
          <option value="algorithm">Algorithm</option>
          <option value="daily">Daily</option>
        </select>
        <select
          value={editData.priority}
          onChange={(e) => setEditData({ ...editData, priority: e.target.value as any })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 text-sm"
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
      <input
        type="text"
        value={editData.tags}
        onChange={(e) => setEditData({ ...editData, tags: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 text-sm"
        placeholder="태그 (쉼표로 구분)"
      />
      <textarea
        value={editData.description}
        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 text-sm"
        rows={3}
      />
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-4 py-1.5 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded text-sm font-bold transition-colors hover:bg-gray-200 dark:hover:bg-gray-600">
          취소
        </button>
        <button onClick={handleSave} className="px-4 py-1.5 bg-blue-500 text-white rounded text-sm font-bold transition-colors hover:bg-blue-600">
          저장
        </button>
      </div>
    </div>
  );
}
