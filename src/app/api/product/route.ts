import { NextResponse } from "next/server";

type Product = {
  code: string;
  name: string;
  price: number;
};

const mockDB: Record<string, Product> = {
  "1234567890": { code: "1234567890", name: "商品A", price: 100 },
  "1111111111": { code: "1111111111", name: "商品B", price: 200 },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  const product = code && mockDB[code];

  if (product) {
    return NextResponse.json(product);
  } else {
    return NextResponse.json(
      { error: "商品が見つかりませんでした" },
      { status: 404 }
    );
  }
}
