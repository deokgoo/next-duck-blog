import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folderName = formData.get('folderName') as string;

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
    }

    // 파일 유효성 검사
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: '지원하지 않는 파일 형식입니다. (jpeg, jpg, png, gif, webp만 지원)',
        },
        { status: 400 }
      );
    }

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: '파일 크기가 너무 큽니다. (최대 5MB)',
        },
        { status: 400 }
      );
    }

    // 파일 이름 생성 (타임스탬프 + 간단한 원본 이름)
    const timestamp = Date.now();
    const extension = file.name.split('.').pop()?.toLowerCase() || 'png';
    const baseName = file.name.replace(/\.[^/.]+$/, ''); // 확장자 제거
    const cleanName = baseName
      .toLowerCase()
      .replace(/[^a-zA-Z0-9가-힣]/g, '-') // 특수문자를 -로 변경
      .replace(/-+/g, '-') // 연속된 -를 하나로
      .replace(/^-|-$/g, '') // 앞뒤 -제거
      .substring(0, 50); // 최대 50자로 제한
    const fileName = `${timestamp}-${cleanName}.${extension}`;

    // 기존 패턴에 맞는 폴더 구조 생성
    let targetFolder = folderName || 'general';

    // 한글 슬러그를 영어로 변환
    if (folderName) {
      targetFolder = folderName
        .toLowerCase()
        .replace(/[가-힣]/g, (match) => {
          // 주요 한글 단어만 영어로 변환
          const koreanToEnglish: Record<string, string> = {
            리뷰: 'review',
            블로그: 'blog',
            개발: 'development',
            프로그래밍: 'programming',
            웹: 'web',
            리액트: 'react',
            자바스크립트: 'javascript',
            타입스크립트: 'typescript',
            넥스트: 'nextjs',
            여행: 'travel',
            회고: 'retrospective',
            알고리즘: 'algorithm',
            데이터베이스: 'database',
            서버: 'server',
            클라이언트: 'client',
            프론트엔드: 'frontend',
            백엔드: 'backend',
            디자인: 'design',
            성능: 'performance',
            최적화: 'optimization',
            보안: 'security',
            테스트: 'test',
            배포: 'deployment',
            도구: 'tools',
            가이드: 'guide',
            튜토리얼: 'tutorial',
            팁: 'tips',
            문제: 'problem',
            해결: 'solution',
            오류: 'error',
            버그: 'bug',
            수정: 'fix',
            업데이트: 'update',
            새로운: 'new',
            비교: 'comparison',
            분석: 'analysis',
            연구: 'research',
            실험: 'experiment',
            예제: 'example',
            코드: 'code',
            라이브러리: 'library',
            프레임워크: 'framework',
            패키지: 'package',
            모듈: 'module',
            컴포넌트: 'component',
            이미지: 'image',
            파일: 'file',
            문서: 'document',
            포스트: 'post',
            글: 'article',
            제목: 'title',
            설명: 'description',
            요약: 'summary',
            사용자: 'user',
            개발자: 'developer',
            디자이너: 'designer',
          };
          return koreanToEnglish[match] || match;
        })
        .replace(/[^a-zA-Z0-9가-힣]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    }

    const imagePath = path.join(process.cwd(), 'public', 'static', 'images', targetFolder);
    const filePath = path.join(imagePath, fileName);

    // 폴더가 없으면 생성
    try {
      await mkdir(imagePath, { recursive: true });
    } catch (error) {
      // 폴더가 이미 존재하는 경우 무시
    }

    // 파일을 버퍼로 변환하여 저장
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(filePath, buffer);

    // 웹에서 접근 가능한 URL 생성
    const imageUrl = `/static/images/${targetFolder}/${fileName}`;

    return NextResponse.json({
      success: true,
      url: imageUrl,
      fileName: fileName,
      folderName: targetFolder,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('이미지 업로드 실패:', error);
    return NextResponse.json(
      {
        error: '이미지 업로드 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
