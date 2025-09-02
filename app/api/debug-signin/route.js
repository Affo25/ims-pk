import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { User } from "@/models";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Initialize database connection
    await connectDB();
    
    // Find user by email
    const foundUser = await User.findOne({ 
      email: email.toLowerCase() 
    });

    console.log("🔍 Debug - User lookup for:", email);
    console.log("🔍 Debug - Found user:", foundUser ? "Yes" : "No");
    
    if (foundUser) {
      console.log("🔍 Debug - Stored password:", foundUser.password);
      console.log("🔍 Debug - Provided password:", password);
      console.log("🔍 Debug - Passwords match:", foundUser.password === password);
      console.log("🔍 Debug - Password types:", typeof foundUser.password, typeof password);
    }

    return NextResponse.json({
      status: "DEBUG",
      found: !!foundUser,
      storedPassword: foundUser?.password || "NOT_FOUND",
      providedPassword: password,
      passwordsMatch: foundUser ? foundUser.password === password : false
    });
  } catch (error) {
    console.error("Debug API error:", error);
    return NextResponse.json({
      status: "ERROR",
      message: error.message
    }, { status: 500 });
  }
}