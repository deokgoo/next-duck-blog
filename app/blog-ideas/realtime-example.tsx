// 실시간 버전 예시 (현재 사용 안함)
import { useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// 이렇게 바꾸면 실시간 업데이트
useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, 'blog-ideas'), (snapshot) => {
    const ideas = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setIdeas(ideas);
  });

  return () => unsubscribe();
}, []);
