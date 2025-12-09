import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("payload-token");
    
    return NextResponse.json({ 
      isAuthenticated: !!token?.value 
    });
  } catch {
    return NextResponse.json({ 
      isAuthenticated: false 
    });
  }
}
