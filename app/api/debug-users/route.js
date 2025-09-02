import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { User } from "@/models";

export async function GET() {
  try {
    // Initialize database connection
    await connectDB();
    
    // Find test users
    const testUsers = await User.find({ 
      email: { $in: ["admin@ims.com", "user@ims.com"] }
    });

    console.log("🔍 Debug - Found users:", testUsers.length);
    
    const debugInfo = testUsers.map(user => ({
      id: user._id,
      email: user.email,
      password: user.password,
      passwordType: typeof user.password,
      passwordLength: user.password ? user.password.length : 0,
      hasPassword: !!user.password
    }));

    return NextResponse.json({
      status: "DEBUG",
      users: debugInfo
    });
  } catch (error) {
    console.error("Debug API error:", error);
    return NextResponse.json({
      status: "ERROR",
      message: error.message
    }, { status: 500 });
  }
}