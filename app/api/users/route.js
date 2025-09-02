import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import { User } from '@/models';
import ShortUniqueId from "short-unique-id";

const uid = new ShortUniqueId();

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = parseInt(searchParams.get('skip') || '0');
    
    const users = await User.find({}, '-password')
      .limit(limit)
      .skip(skip)
      .sort({ created_at: -1 });
    
    const total = await User.countDocuments({});
    
    return NextResponse.json({
      status: 'OK',
      data: users,
      total: total,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { status: 'ERROR', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { action, data, query, id } = body;
    
    switch (action) {
      case 'create':
        const userId = uid.rnd();
        const userDoc = new User({
          _id: userId,
          ...data,
        });
        await userDoc.save();
        
        const userResponse = userDoc.toObject();
        delete userResponse.password;
        
        return NextResponse.json({
          status: 'OK',
          data: userResponse,
        });
        
      case 'find':
        const users = await User.find(query || {}, '-password');
        return NextResponse.json({
          status: 'OK',
          data: users,
        });
        
      case 'findOne':
        const user = await User.findById(id).select('-password');
        return NextResponse.json({
          status: 'OK',
          data: user,
        });
        
      case 'update':
        const updatedUser = await User.findByIdAndUpdate(
          id,
          { ...data, updated_at: new Date() },
          { new: true }
        ).select('-password');
        
        return NextResponse.json({
          status: 'OK',
          data: updatedUser,
        });
        
      case 'delete':
        const deletedUser = await User.findByIdAndDelete(id).select('-password');
        return NextResponse.json({
          status: 'OK',
          message: 'User deleted successfully',
          data: deletedUser,
        });
        
      default:
        return NextResponse.json(
          { status: 'ERROR', message: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in users API:', error);
    return NextResponse.json(
      { status: 'ERROR', message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { ...body, updated_at: new Date() },
      { new: true }
    ).select('-password');
    
    return NextResponse.json({
      status: 'OK',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { status: 'ERROR', message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    const deletedUser = await User.findByIdAndDelete(id).select('-password');
    
    return NextResponse.json({
      status: 'OK',
      message: 'User deleted successfully',
      data: deletedUser,
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { status: 'ERROR', message: error.message },
      { status: 500 }
    );
  }
}