import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { content, metadata } = await request.json();

    // 슬러그 생성 (제목 기반)
    const slug =
      metadata.slug ||
      metadata.title
        .toLowerCase()
        .replace(/[^a-z0-9가-힣]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    // 카테고리 결정 (태그 기반)
    const category = determineCategory(metadata.tags);

    // 파일 경로 설정
    const blogDir = path.join(process.cwd(), 'data', 'blog', category);
    const filePath = path.join(blogDir, `${slug}.mdx`);

    // 디렉토리 생성 (없으면)
    await mkdir(blogDir, { recursive: true });

    // MDX 파일 생성
    const mdxContent = generateMDXContent(content, metadata);

    // 파일 저장
    await writeFile(filePath, mdxContent, 'utf8');

    return NextResponse.json({
      success: true,
      message: '블로그 포스트가 성공적으로 저장되었습니다!',
      filePath: path.relative(process.cwd(), filePath),
      slug,
    });
  } catch (error) {
    console.error('파일 저장 중 오류:', error);
    return NextResponse.json(
      { success: false, message: '파일 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

function determineCategory(tags: string[]): string {
  // 태그 기반으로 카테고리 결정
  const categoryMap: { [key: string]: string } = {
    react: 'react',
    nextjs: 'nextjs',
    javascript: 'js',
    js: 'js',
    알고리즘: 'algorithm',
    algorithm: 'algorithm',
    여행: 'travel',
    travel: 'travel',
    일상: 'daily',
    daily: 'daily',
    웹: 'web',
    web: 'web',
    프론트엔드: 'web',
    frontend: 'web',
    백엔드: 'web',
    backend: 'web',
  };

  // 태그 중에서 카테고리에 매핑되는 것 찾기
  for (const tag of tags) {
    const category = categoryMap[tag.toLowerCase()];
    if (category) return category;
  }

  // 기본 카테고리
  return 'general';
}

interface BlogMetadata {
  title: string;
  date: string;
  tags: string[];
  draft: boolean;
  summary: string;
  layout?: string;
  slug?: string;
  images?: string[];
}

function generateMDXContent(content: string, metadata: BlogMetadata): string {
  // content가 이미 frontmatter를 포함하고 있는지 확인
  if (content.startsWith('---')) {
    return content; // 이미 frontmatter가 있으면 그대로 반환
  }

  // Frontmatter 생성
  const frontmatter = [
    '---',
    `title: '${metadata.title}'`,
    `date: '${metadata.date}'`,
    `tags: [${metadata.tags.map((tag: string) => `'${tag}'`).join(', ')}]`,
    `draft: ${metadata.draft}`,
    `summary: '${metadata.summary}'`,
    ...(metadata.layout ? [`layout: ${metadata.layout}`] : []),
    ...(metadata.slug ? [`slug: '${metadata.slug}'`] : []),
    ...(metadata.images && metadata.images.length > 0
      ? [`images: [${metadata.images.map((img: string) => `'${img}'`).join(', ')}]`]
      : []),
    '---',
    '',
  ].join('\n');

  return frontmatter + content;
}
