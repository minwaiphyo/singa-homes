import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs'; // You'll need to install this: npm install bcryptjs @types/bcryptjs

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Hash a sample password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create a sample user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        hashedPassword: hashedPassword,
        emailVerified: true,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User seeded successfully',
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        isActive: user.isActive,
        create_at: user.create_at,
      },
    });
  } catch (error: any) {
    // Handle duplicate email error
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        message: 'User with this email already exists',
        error: 'Duplicate email',
      }, { status: 400 });
    }

    console.error('Seeding error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to seed user',
      error: error.message,
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Optional: GET method to check existing users
export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        emailVerified: true,
        isActive: true,
        create_at: true,
      },
    });

    return NextResponse.json({
      success: true,
      users,
      count: users.length,
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}