import { NextResponse } from "next/server";
import { signInUser } from "@/lib/actions";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { 
          status: "ERROR", 
          message: "Email and password are required" 
        },
        { status: 400 }
      );
    }

    // Create FormData to match the signInUser function signature
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    
    const result = await signInUser(formData);
    
    if (result.status === "ERROR") {
      return NextResponse.json(result, { status: 401 });
    }

    // Set session cookie
    const response = NextResponse.json(result);
    if (result.data?.session_token) {
      response.cookies.set("session_token", result.data.session_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 // 24 hours
      });
    }

    return response;
  } catch (error) {
    console.error("Signin API error:", error);
    return NextResponse.json(
      { 
        status: "ERROR", 
        message: "Internal server error" 
      },
      { status: 500 }
    );
  }
}