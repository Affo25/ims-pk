import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { User } from "@/models";
import ShortUniqueId from "short-unique-id";

const uid = new ShortUniqueId();

export async function POST() {
  try {
    await connectDB();
    
    // Check if users already exist
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      return NextResponse.json({
        status: "OK",
        message: "Users already exist in database",
        data: { count: existingUsers }
      });
    }

    // Create test users
    const testUsers = [
      {
        _id: uid.rnd(),
        email: "admin@test.com",
        password: "admin123", // In production, this should be hashed
        first_name: "Admin",
        last_name: "User",
        designation: "Administrator",
        type: "admin",
        areas: ["dashboard", "sales", "marketing", "events", "development", "accounts", "users"],
        status: "active"
      },
      {
        _id: uid.rnd(),
        email: "user@test.com",
        password: "user123", // In production, this should be hashed
        first_name: "Test",
        last_name: "User",
        designation: "Sales Manager",
        type: "sales",
        areas: ["dashboard", "sales"],
        status: "active"
      }
    ];

    await User.insertMany(testUsers);

    return NextResponse.json({
      status: "OK",
      message: "Test users created successfully",
      data: {
        users: testUsers.map(user => ({
          email: user.email,
          type: user.type,
          areas: user.areas
        }))
      }
    });

  } catch (error) {
    console.error("Init users error:", error);
    return NextResponse.json(
      { 
        status: "ERROR", 
        message: error.message 
      },
      { status: 500 }
    );
  }
}