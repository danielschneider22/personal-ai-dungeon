import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json(
      { message: "Server misconfiguration" },
      { status: 500 }
    );
  }

  if (password === adminPassword) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json(
      { success: false, message: "Invalid password" },
      { status: 401 }
    );
  }
}
