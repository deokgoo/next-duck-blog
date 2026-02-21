import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/firebaseAdmin';
import { verifyAuth } from '@/lib/auth/serverAuth';

export async function POST(request: NextRequest) {
  try {
    if (!(await verifyAuth(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // 기본 버킷 참조
    const bucket = storage.bucket();
    
    // 폴더 경로 설정 (Storage내 경로)
    // 기존 로직 유지: 한글 폴더명 -> 영어 변환 로직은 복잡도를 위해 생략하거나 필요시 추가 가능
    // 여기서는 folderName을 그대로 사용 (Firebase Storage는 폴더 개념이 없지만 경로로 시뮬레이션)
    // 보안을 위해 folderName을 정제
    const safeFolderName = (folderName || 'general').replace(/[^a-zA-Z0-9-_]/g, '-');
    const filePath = `images/${safeFolderName}/${fileName}`;
    const fileRef = bucket.file(filePath);

    // 파일을 버퍼로 변환
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Firebase Storage에 업로드
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
      },
      public: true, // 공개적으로 접근 가능하게 설정
    });

    // 공개 URL 생성
    // 방법 1: public: true로 설정하고 publicUrl() 사용 (GCS 리전 문제로 안될 수 있음)
    // 방법 2: Firebase Storage URL 포맷 직접 구성 (https://firebasestorage.googleapis.com/v0/b/[bucket]/o/[path]?alt=media)
    // 방법 3: Google Storage API URL (https://storage.googleapis.com/[bucket]/[path]) -> public: true 필요

    // 여기서는 가장 호환성이 좋은 방법 3 사용 (next/image 도메인 설정 필요할 수 있음)
    // 또는 방법 2가 Firebase 클라이언트와 호환성이 좋음
    const bucketName = bucket.name;
    const encodedPath = encodeURIComponent(filePath);
    // Firebase Client SDK 스타일 URL (토큰 없이 접근 가능하려면 규칙 설정 필요, public: true면 Google Storage URL도 가능)
    
    // public() 호출로 ACL을 공개로 설정했으므로 publicUrl을 사용하거나 구성
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${filePath}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName,
      folderName: safeFolderName,
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
