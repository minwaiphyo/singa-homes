// app/api/auth/register/route.ts
// Make sure this file is located at: app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { getSession } from 'next-auth/react';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Destructure form data
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const age = formData.get("age") ? Number(formData.get("age")) : undefined;
    const phone = formData.get("phone") as string | null;
    const avatar = formData.get("avatar") as File | null;
    
    // No need bio during initial sign up 
    //const bio = formData.get("bio") as string | null;


    // Validate form data
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, password, firstName, and lastName are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Validate age if provided
    if (age !== undefined && (age < 0 || age > 150)) {
      return NextResponse.json(
        { error: 'Age must be between 0 and 150' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    

    // If avatar file provided, upload it to Supabase Storage
    let avatarUrl = null;
    if (avatar) {
      const ext = avatar?.name.split(".").pop();

      //Generate filePath
      const filePath = `avatars/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
                                      .from("Avatar")
                                      .upload(filePath, avatar!);
      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        return NextResponse.json(
          { error: 'Error uploading avatar' },
          { status: 500 }
        );
      }

      const { data: publicUrlData } = supabase.storage
                                        .from("Avatar")
                                        .getPublicUrl(filePath);
      avatarUrl = publicUrlData.publicUrl;
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        age: age || null,
        phone: phone || null,
        bio: null,

        // Need to upload File avatar to Supabase storage to get URL before assigning it to avatar field
        avatar: avatarUrl || null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        age: true,
        phone: true,
        bio: true,
        avatar: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { 
        message: 'User registered successfully',
        user: newUser 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}