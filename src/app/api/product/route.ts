import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  const mockDB = {
    '1234567890': { code: '1234567890', name: 'おーいお茶', price: 150 },
    '1111111111': { code: '1111111111', name: '午後の紅茶', price: 160 },
  };

  const product = code && mockDB[code];

  if (product) {
    return NextResponse.json(product);
  } else {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
