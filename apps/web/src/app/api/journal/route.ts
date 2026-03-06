import { NextResponse } from "next/server";

const message = "Daily journal endpoint removed. Use /api/trades with trade-level review fields.";

export async function GET() {
  return NextResponse.json({ error: message }, { status: 410 });
}

export async function POST() {
  return NextResponse.json({ error: message }, { status: 410 });
}
