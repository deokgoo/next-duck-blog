'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import UltimateEditor from '@/components/editor/UltimateEditor';
import { Post } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function EditorClientWrapper() {
    const searchParams = useSearchParams();
    const slug = searchParams.get('slug');
    const { user } = useAuth();

    const [initialData, setInitialData] = useState<Post | null>(null);
    const [isLoading, setIsLoading] = useState(!!slug);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug || !user) {
            if (!slug) setIsLoading(false);
            return;
        }

        const fetchPost = async () => {
            try {
                const token = await user.getIdToken();
                const res = await fetch(`/api/admin/post?slug=${encodeURIComponent(slug)}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    setInitialData(data.post);
                } else {
                    setError('포스트를 불러오는데 실패했습니다.');
                }
            } catch (err) {
                console.error('Error fetching post:', err);
                setError('오류가 발생했습니다.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPost();
    }, [slug, user]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center p-8 bg-white dark:bg-black">
                <div className="flex flex-col items-center gap-4 text-gray-500">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>에디터를 준비 중입니다...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center p-8">
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-900/20">
                    <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                </div>
            </div>
        );
    }

    return <UltimateEditor initialData={initialData} />;
}
