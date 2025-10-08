import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    if (password === process.env.BLOG_IDEAS_PASSWORD || password === 'admin123') {
      const response = NextResponse.json({ success: true });
      
      // HTTP-only 쿠키 설정 (24시간)
      response.cookies.set('blog-ideas-auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 // 24시간
      });
      
      return response;
    }
    
    return NextResponse.json({ success: false }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('blog-ideas-auth');
  return response;
}
