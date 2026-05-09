'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { Heart } from 'lucide-react'

interface EngagementStat {
  likes: number
  baseLikes: number
  total: number
}

export default function EngagementPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Record<string, EngagementStat>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    document.title = '좋아요 관리 | Admin'
    if (user) fetchStats()
  }, [user])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const token = await user?.getIdToken()
      const res = await fetch('/api/engagement/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats || {})
      }
    } catch (error) {
      console.error('Error fetching engagement stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const startEdit = (slug: string, currentBaseLikes: number) => {
    setEditingSlug(slug)
    setEditValue(String(currentBaseLikes))
  }

  const cancelEdit = () => {
    setEditingSlug(null)
    setEditValue('')
  }

  const saveBaseLikes = async (slug: string) => {
    const baseLikes = parseInt(editValue, 10)
    if (isNaN(baseLikes) || baseLikes < 0) {
      alert('0 이상의 정수를 입력해주세요.')
      return
    }

    setSaving(true)
    try {
      const token = await user?.getIdToken()
      const res = await fetch('/api/engagement/admin/base-likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ slug, baseLikes }),
      })

      if (res.ok) {
        setStats((prev) => ({
          ...prev,
          [slug]: {
            ...prev[slug],
            baseLikes,
            total: (prev[slug]?.likes ?? 0) + baseLikes,
          },
        }))
        setEditingSlug(null)
      } else {
        alert('저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error saving baseLikes:', error)
      alert('오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const sortedEntries = Object.entries(stats).sort(([, a], [, b]) => b.total - a.total)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 xl:px-8">
      <div className="space-y-6 pt-6 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">좋아요 관리</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              각 포스트의 기본 좋아요(baseLikes)를 설정하면 실제 좋아요와 합산되어 표시됩니다.
            </p>
          </div>
          <button
            onClick={fetchStats}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          >
            새로고침
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Slug
                </th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center">
                  실제 좋아요
                </th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center">
                  기본값 (baseLikes)
                </th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center">
                  합계 (표시)
                </th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                    <div className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                      불러오는 중...
                    </div>
                  </td>
                </tr>
              ) : sortedEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                    아직 좋아요 데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                sortedEntries.map(([slug, stat]) => (
                  <tr key={slug} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{slug}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Heart className="h-3.5 w-3.5 text-pink-500" fill="currentColor" />
                        {stat.likes}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {editingSlug === slug ? (
                        <input
                          type="number"
                          min="0"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveBaseLikes(slug)
                            if (e.key === 'Escape') cancelEdit()
                          }}
                          className="w-20 rounded border border-gray-300 px-2 py-1 text-center text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                          autoFocus
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {stat.baseLikes}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-pink-50 px-2.5 py-0.5 text-sm font-bold text-pink-600 dark:bg-pink-900/20 dark:text-pink-400">
                        {stat.total}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editingSlug === slug ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => saveBaseLikes(slug)}
                            disabled={saving}
                            className="rounded px-3 py-1 text-xs font-medium text-white bg-primary-500 hover:bg-primary-600 disabled:opacity-50 transition-colors"
                          >
                            {saving ? '저장 중...' : '저장'}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="rounded px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(slug, stat.baseLikes)}
                          className="rounded px-3 py-1 text-xs font-bold uppercase tracking-tighter text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
