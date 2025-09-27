// app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Use the singleton instead of creating new instance
import bcrypt from 'bcryptjs';

// GET - Fetch user profile by userId or email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');

    if (!userId && !email) {
      return NextResponse.json(
        { error: 'Either userId or email is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: userId ? { id: userId } : { email: email! },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        age: true,
        phone: true,
        bio: true,
        avatar: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            properties: true,
            favorites: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// // POST - Create new user profile (This should probably be removed since registration handles user creation)
// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
    
//     // Validate required fields - PASSWORD is required in your schema
//     const { email, password, firstName, lastName } = body;
    
//     if (!email || !password || !firstName || !lastName) {
//       return NextResponse.json(
//         { error: 'Email, password, firstName, and lastName are required' },
//         { status: 400 }
//       );
//     }

//     // Validate email format
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return NextResponse.json(
//         { error: 'Invalid email format' },
//         { status: 400 }
//       );
//     }

//     // Validate password strength
//     if (password.length < 8) {
//       return NextResponse.json(
//         { error: 'Password must be at least 8 characters long' },
//         { status: 400 }
//       );
//     }

//     // Validate age if provided
//     if (body.age !== undefined && (body.age < 0 || body.age > 150)) {
//       return NextResponse.json(
//         { error: 'Age must be between 0 and 150' },
//         { status: 400 }
//       );
//     }

//     // Check if user already exists
//     const existingUser = await prisma.user.findUnique({
//       where: { email: email.toLowerCase() },
//     });

//     if (existingUser) {
//       return NextResponse.json(
//         { error: 'User with this email already exists' },
//         { status: 409 }
//       );
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 12);

//     // Create new user
//     const newUser = await prisma.user.create({
//       data: {
//         email: email.toLowerCase(),
//         password: hashedPassword, // This was missing in original
//         firstName,
//         lastName,
//         age: body.age || null,
//         phone: body.phone || null,
//         bio: body.bio || null,
//         avatar: body.avatar || null,
//         isEmailVerified: body.isEmailVerified || false, // Added this field
//       },
//       select: {
//         id: true,
//         email: true,
//         firstName: true,
//         lastName: true,
//         age: true,
//         phone: true,
//         bio: true,
//         avatar: true,
//         isEmailVerified: true,
//         createdAt: true,
//         updatedAt: true,
//       },
//     });

//     return NextResponse.json(
//       { 
//         message: 'Profile created successfully',
//         user: newUser 
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error('Error creating profile:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// PUT - Update existing user profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required field
    const { userId } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Validate age if provided
    if (body.age !== undefined && (body.age < 0 || body.age > 150)) {
      return NextResponse.json(
        { error: 'Age must be between 0 and 150' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prepare update data (only include fields that are provided)
    const updateData: any = {};
    
    if (body.firstName !== undefined) updateData.firstName = body.firstName;
    if (body.lastName !== undefined) updateData.lastName = body.lastName;
    if (body.age !== undefined) updateData.age = body.age;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.avatar !== undefined) updateData.avatar = body.avatar;
    if (body.isEmailVerified !== undefined) updateData.isEmailVerified = body.isEmailVerified;

    // Handle password update separately with hashing
    if (body.password && body.password.length >= 8) {
      updateData.password = await bcrypt.hash(body.password, 12);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        age: true,
        phone: true,
        bio: true,
        avatar: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      { 
        message: 'Profile updated successfully',
        user: updatedUser 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user profile
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete user (this will cascade delete related records due to Prisma schema)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json(
      { message: 'Profile deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}