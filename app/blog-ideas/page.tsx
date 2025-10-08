'use client';

import { useState, useEffect } from 'react';

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
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
};

const statusColors = {
  planned: 'bg-gray-100 text-gray-800',
  draft: 'bg-blue-100 text-blue-800',
  writing: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
};

export default function BlogIdeasPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [ideas, setIdeas] = useState<BlogIdea[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newIdea, setNewIdea] = useState({
    title: '',
    category: 'web',
    tags: '',
    priority: 'medium' as const,
    description: '',
  });

  useEffect(() => {
    document.title = '블로그 아이디어 | Your Blog';
    // 서버에서 인증 상태 확인
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/blog-ideas');
      if (response.ok) {
        setIsAuthenticated(true);
        const data = await response.json();
        setIdeas(data.ideas || []);
      }
    } catch (error) {
      // 인증되지 않음
    }
  };

  const fetchIdeas = async () => {
    try {
      const response = await fetch('/api/blog-ideas');
      const data = await response.json();
      setIdeas(data.ideas || []);
    } catch (error) {
      console.error('아이디어 로드 실패:', error);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/blog-ideas/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      
      if (response.ok) {
        setIsAuthenticated(true);
        fetchIdeas();
      } else {
        alert('비밀번호가 틀렸습니다.');
      }
    } catch (error) {
      alert('로그인 중 오류가 발생했습니다.');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/blog-ideas/auth', { method: 'DELETE' });
      setIsAuthenticated(false);
      setIdeas([]);
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  // 로그인 화면
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
              블로그 아이디어 관리
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              비밀번호를 입력하세요
            </p>
          </div>
          <div className="mt-8 space-y-6">
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800"
            />
            <button
              onClick={handleLogin}
              className="w-full px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
            >
              로그인
            </button>
          </div>
        </div>
      </div>
    );
  }

  const addIdea = async () => {
    if (!newIdea.title.trim()) return;

    const idea = {
      ...newIdea,
      tags: newIdea.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      status: 'planned' as const,
    };

    try {
      const response = await fetch('/api/blog-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      await fetch('/api/blog-ideas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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
      await fetch('/api/blog-ideas', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchIdeas();
    } catch (error) {
      console.error('아이디어 삭제 실패:', error);
    }
  };

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pb-8 pt-6 md:space-y-5">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
              블로그 아이디어
            </h1>
            <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
              앞으로 작성할 블로그 글 아이디어를 관리합니다
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* 새 아이디어 추가 */}
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-4">새 아이디어 추가</h2>
        <div className="space-y-4 max-w-2xl">
          <input
            type="text"
            placeholder="제목"
            value={newIdea.title}
            onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800"
          />
          <div className="flex gap-4">
            <select
              value={newIdea.category}
              onChange={(e) => setNewIdea({ ...newIdea, category: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800"
            >
              <option value="web">Web</option>
              <option value="react">React</option>
              <option value="nextjs">Next.js</option>
              <option value="js">JavaScript</option>
              <option value="algorithm">Algorithm</option>
              <option value="daily">Daily</option>
            </select>
            <select
              value={newIdea.priority}
              onChange={(e) => setNewIdea({ ...newIdea, priority: e.target.value as any })}
              className="px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="태그 (쉼표로 구분)"
            value={newIdea.tags}
            onChange={(e) => setNewIdea({ ...newIdea, tags: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800"
          />
          <textarea
            placeholder="설명"
            value={newIdea.description}
            onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800"
            rows={3}
          />
          <button
            onClick={addIdea}
            className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
          >
            추가
          </button>
        </div>
      </div>

      {/* 아이디어 목록 */}
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-4">아이디어 목록 ({ideas.length})</h2>
        <div className="space-y-4">
          {ideas.map((idea) => (
            <div key={idea.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
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
      </div>
    </div>
  );
}

function ViewMode({ idea, onEdit, onDelete, onStatusChange }: {
  idea: BlogIdea;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: BlogIdea['status']) => void;
}) {
  return (
    <>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">{idea.title}</h3>
        <div className="flex gap-2">
          <span className={`px-2 py-1 rounded-full text-xs ${priorityColors[idea.priority]}`}>
            {idea.priority}
          </span>
          <select
            value={idea.status}
            onChange={(e) => onStatusChange(e.target.value as BlogIdea['status'])}
            className={`px-2 py-1 rounded-full text-xs border-0 ${statusColors[idea.status]}`}
          >
            <option value="planned">Planned</option>
            <option value="draft">Draft</option>
            <option value="writing">Writing</option>
            <option value="completed">Completed</option>
          </select>
          <button onClick={onEdit} className="px-2 py-1 text-xs bg-blue-500 text-white rounded">
            수정
          </button>
          <button onClick={onDelete} className="px-2 py-1 text-xs bg-red-500 text-white rounded">
            삭제
          </button>
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-2">{idea.description}</p>
      <div className="flex gap-2 mb-2">
        {idea.tags.map((tag) => (
          <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm">
            {tag}
          </span>
        ))}
      </div>
      <div className="text-sm text-gray-500">
        카테고리: {idea.category} | 생성일: {new Date(idea.createdAt).toLocaleDateString()}
      </div>
    </>
  );
}

function EditForm({ idea, onSave, onCancel }: {
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
      tags: editData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    });
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={editData.title}
        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800"
      />
      <div className="flex gap-4">
        <select
          value={editData.category}
          onChange={(e) => setEditData({ ...editData, category: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800"
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
          className="px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800"
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
        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800"
      />
      <textarea
        value={editData.description}
        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800"
        rows={3}
      />
      <div className="flex gap-2">
        <button onClick={handleSave} className="px-4 py-2 bg-green-500 text-white rounded-md">
          저장
        </button>
        <button onClick={onCancel} className="px-4 py-2 bg-gray-500 text-white rounded-md">
          취소
        </button>
      </div>
    </div>
  );
}
