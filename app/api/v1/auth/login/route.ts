import { NextRequest, NextResponse } from "next/server";
import { generateToken } from "@/app/lib/auth/jwt";

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json(
      { error: "Email obrigatório" },
      { status: 400 }
    );
  }

  const token = generateToken({ email });

  return NextResponse.json({ token });
}
