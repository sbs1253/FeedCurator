import { NextResponse } from 'next/server';

export async function POST() {
  const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ error: '웹훅 URL이 설정되지 않았습니다.' }, { status: 500 });
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ trigger: 'manual_sync', source: 'dashboard' }),
    });

    if (!res.ok) {
      throw new Error(`웹훅 서버 오류: ${res.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
