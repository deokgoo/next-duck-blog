import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const BUTTONDOWN_API_KEY = process.env.BUTTONDOWN_API_KEY;

    if (!BUTTONDOWN_API_KEY) {
      return NextResponse.json({ error: 'Newsletter configuration missing' }, { status: 500 });
    }

    // Buttondown API 호출
    const response = await fetch('https://api.buttondown.email/v1/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${BUTTONDOWN_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email, // Buttondown은 email_address 필드 사용
      }),
    });

    if (response.ok) {
      return NextResponse.json({ message: 'Successfully subscribed!' });
    } else {
      const errorData = await response.json();
      console.error('Buttondown API error:', errorData);
      console.error('Response status:', response.status);

      // 상세한 에러 정보 반환 (디버깅용)
      if (errorData.code === 'subscriber_blocked') {
        return NextResponse.json({
          error: 'This email address cannot be subscribed',
          details: errorData.detail || 'Email blocked by Buttondown',
          code: errorData.code
        }, { status: 400 });
      }

      if (errorData.code === 'duplicate_subscriber') {
        return NextResponse.json({
          error: 'This email is already subscribed',
          code: errorData.code
        }, { status: 400 });
      }

      // 기타 에러들도 상세 정보 포함
      return NextResponse.json({
        error: 'Failed to subscribe',
        details: errorData.detail || 'Unknown error',
        code: errorData.code || 'unknown'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET 요청 처리 (필요한 경우)
export async function GET() {
  return NextResponse.json({ message: 'Newsletter API endpoint' });
}
