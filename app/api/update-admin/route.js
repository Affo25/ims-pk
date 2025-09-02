import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { User } from "@/models";

export async function POST() {
  try {
    await connectDB();
    
    // Update admin user with areas
    const result = await User.updateOne(
      { email: "admin@ims.com" },
      { 
        $set: { 
          areas: ["dashboard", "sales", "events", "development", "marketing", "accounts", "international", "users", "EventsList"],
          designation: "System Administrator",
          updated_at: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({
        status: "ERROR",
        message: "Admin user not found"
      }, { status: 404 });
    }

    console.log("✅ Admin user updated with areas");

    return NextResponse.json({
      status: "OK",
      message: "Admin user updated successfully",
      data: {
        modifiedCount: result.modifiedCount,
        areas: ["dashboard", "sales", "events", "development", "marketing", "accounts", "international", "users", "EventsList"]
      }
    });
  } catch (error) {
    console.error("Update admin API error:", error);
    return NextResponse.json(
      { 
        status: "ERROR", 
        message: "Failed to update admin user",
        error: error.message
      },
      { status: 500 }
    );
  }
}