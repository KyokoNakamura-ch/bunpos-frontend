import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const data = await request.json();

  // 🔽 このログで確認する！
  console.log('✅ 購入データ受信:', JSON.stringify(data, null, 2));

  return NextResponse.json({
    success: true,
    message: '購入完了しました',
  });
}