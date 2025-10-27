import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Use the singleton instead of creating new instance
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';


// GET - Fetch current user profile

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {

  //Validate session
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized. Please sign in to view profile.' },
      { status: 401 }
    )
  };

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {id},
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