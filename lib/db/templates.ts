import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

export interface Template {
  id: string;
  name: string;
  category: string; // 'Travel', 'Tech', 'Food', 'Hobby', etc.
  content: string;
  description?: string;
  createdAt: number;
}

const COLLECTION_NAME = 'templates';

export async function getTemplates(): Promise<Template[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Template));
  } catch (error) {
    console.error('Error getting templates:', error);
    return [];
  }
}

export async function saveTemplate(template: Omit<Template, 'id' | 'createdAt'> & { id?: string }) {
  try {
    const id = template.id || doc(collection(db, COLLECTION_NAME)).id;
    const data: Template = {
      ...template,
      id,
      createdAt: Date.now(),
    };
    await setDoc(doc(db, COLLECTION_NAME, id), data);
    return id;
  } catch (error) {
    console.error('Error saving template:', error);
    throw error;
  }
}

export async function deleteTemplate(id: string) {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
}

// 초기 탬플릿 데이터 시딩용 (필요시 호출)
export async function seedInitialTemplates() {
  const initialTemplates = [
    {
      name: '여행 포스트',
      category: 'Travel',
      description: '여행 일정, 숙소, 맛집 정보를 정리하기 좋은 탬플릿',
      content: `# [여행지 이름] 여행기 ✈️

## 📅 일정 요약
- **기간**: 202X.XX.XX ~ 202X.XX.XX (X박 X일)
- **숙소**: [숙소 이름]
- **교통**: [항공편/기차 등]

## DAY 1: 도착 및 첫인상
(여기에 첫날의 여정을 기록하세요)

## DAY 2: 주요 명소 탐방
(여기에 둘째날의 여정을 기록하세요)

## 🏨 숙소 후기
- **위치**: (5점 만점에 X점)
- **청결도**: (5점 만점에 X점)
- **한줄평**: 

## 🍽️ 맛집 추천
1. **[식당 이름]**: 대표 메뉴 ...
2. **[카페 이름]**: 분위기 ...

## 💡 여행 팁
- 환전은 어디서?
- 날씨와 옷차림?
`,
    },
    {
      name: '기술 블로그 (Tech)',
      category: 'Tech',
      description: '코드 스니펫과 설명이 포함된 기술 아티클 탬플릿',
      content: `# [주제/기술 이름] 완벽 가이드 🚀

## 개요 (Overview)
이 포스트에서는 [기술/라이브러리]의 핵심 기능과 사용법을 다룹니다.

## 🛠️ 설치 및 설정 (Installation)

\`\`\`bash
npm install package-name
\`\`\`

## ✨ 주요 기능 (Features)

### 1. 기능 A
설명...

\`\`\`typescript
const example = () => {
  console.log('Hello World');
};
\`\`\`

### 2. 기능 B
설명...

## ⚠️ 주의사항 (Gotchas)
- 주의할 점 1
- 주의할 점 2

## 🔗 참고 자료 (References)
- [공식 문서](https://example.com)
`,
    },
    {
      name: '맛집 탐방',
      category: 'Food',
      description: '음식 사진과 맛 평가를 기록하는 탬플릿',
      content: `# [식당 이름] - [지역명] 맛집 탐방 🍽️

## 📍 기본 정보
- **주소**: [주소 입력]
- **영업시간**: XX:XX ~ XX:XX
- **대표 메뉴**: [메뉴 이름]

## 📸 분위기 및 인테리어
(매장 내부 사진과 분위기 설명)

## 😋 메뉴 후기

### [메뉴 1 이름]
- **가격**: 00,000원
- **맛 평가**: (맛에 대한 상세한 묘사)

### [메뉴 2 이름]
- **가격**: 00,000원
- **맛 평가**: ...

## ⭐ 총평
- **맛**: ⭐⭐⭐⭐⭐
- **가성비**: ⭐⭐⭐⭐
- **재방문 의사**: 있음/없음
`,
    },
  ];

  for (const t of initialTemplates) {
    await saveTemplate(t);
  }
}
