import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Server-side supabase client using service role key for storage operations
// IMPORTANT: SUPABASE_SERVICE_ROLE_KEY is a server-only secret (service role)
const serverSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

function getStoragePathFromPublicUrl(url: string | null | undefined) {
  if (!url) return null;
  try {
    // Supabase public URL pattern:
    // https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
    const marker = '/storage/v1/object/public/';
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    const remainder = url.slice(idx + marker.length); // "<bucket>/<path>"
    const parts = remainder.split('/');
    if (parts.length < 2) return null;
    // drop bucket name
    parts.shift();
    return parts.join('/');
  } catch {
    return null;
  }
}

// GET - Fetch current user profile
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized. Please sign in to view profile.' },
      { status: 401 }
    );
  }

  try {
    const id = request.nextUrl.pathname.split('/').pop();
    if (!id) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('[GET] Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update user profile (accepts multipart/form-data and file upload)
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = request.nextUrl.pathname.split('/').pop();
    if (!id) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    if (id !== session.user.id) {
      return NextResponse.json({ error: 'You can only update your own profile' }, { status: 403 });
    }

    const formData = await request.formData();

    const firstName = formData.get('firstName')?.toString().trim() ?? undefined;
    const lastName = formData.get('lastName')?.toString().trim() ?? undefined;
    const ageRaw = formData.get('age')?.toString().trim();
    const phone = formData.get('phone')?.toString().trim() ?? undefined;
    const bio = formData.get('bio')?.toString().trim() ?? undefined;

    const age = ageRaw ? parseInt(ageRaw, 10) : undefined;

    // Fetch existing avatar (for potential use or information)
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { avatar: true },
    });
    const previousAvatarUrl = existingUser?.avatar ?? null;
    const previousAvatarPath = getStoragePathFromPublicUrl(previousAvatarUrl);

    // Handle avatar file (if provided)
    const avatarFile = formData.get('avatar') as File | null;
    let newAvatarPublicUrl: string | undefined;
    let newAvatarPath: string | undefined;

    if (avatarFile && avatarFile.size > 0) {
      // First: delete any existing files under the user's folder in the Avatar bucket
      try {
        console.log('[AVATAR] Listing existing files for user folder:', id);
        const { data: existingFiles, error: listErr } = await serverSupabase.storage
          .from('Avatar')
          .list(id, { limit: 100 });

        if (listErr) {
          console.warn('[AVATAR] Could not list existing user files:', listErr);
        } else if (Array.isArray(existingFiles) && existingFiles.length > 0) {
          const pathsToRemove = existingFiles.map((it: any) => `${id}/${it.name}`);
          console.log('[AVATAR] Removing existing files for user:', pathsToRemove);
          const { error: removeErr } = await serverSupabase.storage
            .from('Avatar')
            .remove(pathsToRemove);
          if (removeErr) {
            console.warn('[AVATAR] Failed to remove some existing files:', removeErr);
            // don't fail here — continue to attempt upload (but log)
          } else {
            console.log('[AVATAR] Successfully removed previous avatar files for user:', id);
          }
        } else {
          console.log('[AVATAR] No existing files to remove for user:', id);
        }
      } catch (cleanupListErr) {
        console.error('[AVATAR] Exception while cleaning previous files:', cleanupListErr);
        // continue to upload; user requested delete-then-upload but we don't want to block upload if listing fails
      }

      // Validate file type & size (server-side)
      if (!avatarFile.type || !avatarFile.type.startsWith('image/')) {
        return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
      }
      if (avatarFile.size > 2 * 1024 * 1024) {
        return NextResponse.json({ error: 'Image must be less than 2MB' }, { status: 400 });
      }

      try {
        // Create new path: keep naming convention used on sign-up
        const fileName = avatarFile.name || `avatar-${Date.now()}`;
        const ext = fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() : 'png';
        newAvatarPath = `${id}/avatar-${Date.now()}.${ext}`;

        // Convert file to Buffer
        const arrayBuffer = await avatarFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log('[AVATAR] Uploading new avatar to Avatar bucket at path:', newAvatarPath);

        const { data: uploadData, error: uploadErr } = await serverSupabase.storage
          .from('Avatar')
          .upload(newAvatarPath, buffer, {
            cacheControl: '3600',
            contentType: avatarFile.type || 'application/octet-stream',
            upsert: false,
          });

        console.log('[AVATAR] Upload response:', { uploadData, uploadErr });

        if (uploadErr) {
          console.error('[AVATAR] Supabase upload error:', uploadErr);
          return NextResponse.json(
            {
              error: 'Failed to upload avatar',
              details: uploadErr.message || JSON.stringify(uploadErr),
            },
            { status: 500 }
          );
        }

        // Get public URL
        const { data: publicData } = await serverSupabase.storage
          .from('Avatar')
          .getPublicUrl(newAvatarPath);
        newAvatarPublicUrl = publicData?.publicUrl ?? undefined;

        console.log('[AVATAR] New avatar public url:', newAvatarPublicUrl);
      } catch (uploadException) {
        console.error('[AVATAR] Exception during upload:', uploadException);
        return NextResponse.json(
          {
            error: 'Failed to upload avatar',
            details: uploadException instanceof Error ? uploadException.message : 'Unknown',
          },
          { status: 500 }
        );
      }
    }

    // Build update data
    const updateData: any = {};
    if (firstName !== undefined && firstName !== '') updateData.firstName = firstName;
    if (lastName !== undefined && lastName !== '') updateData.lastName = lastName;
    if (age !== undefined && !Number.isNaN(age)) updateData.age = age;
    if (phone !== undefined && phone !== '') updateData.phone = phone;
    if (bio !== undefined && bio !== '') updateData.bio = bio;
    if (newAvatarPublicUrl) updateData.avatar = newAvatarPublicUrl;

    console.log('[PROFILE UPDATE] Updating user with data:', updateData);

    // Update database
    try {
      const updatedUser = await prisma.user.update({
        where: { id },
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

      // After successful update, double-check and remove any leftover files in folder that are not the new file
      try {
        if (newAvatarPath) {
          const { data: listAfter, error: listAfterErr } = await serverSupabase.storage
            .from('Avatar')
            .list(id, { limit: 100 });

          if (listAfterErr) {
            console.warn('[AVATAR] Could not list files after upload:', listAfterErr);
          } else if (Array.isArray(listAfter)) {
            const toRemove: string[] = [];
            for (const item of listAfter) {
              const full = `${id}/${item.name}`;
              if (full !== newAvatarPath) toRemove.push(full);
            }
            if (toRemove.length > 0) {
              const { error: removeErr } = await serverSupabase.storage.from('Avatar').remove(toRemove);
              if (removeErr) {
                console.warn('[AVATAR] Failed removing extra files after update:', removeErr);
              } else {
                console.log('[AVATAR] Removed extra files after update:', toRemove);
              }
            }
          }
        }
      } catch (cleanupAfterErr) {
        console.error('[AVATAR] Cleanup-after-update error:', cleanupAfterErr);
      }

      return NextResponse.json({ user: updatedUser }, { status: 200 });
    } catch (dbErr) {
      console.error('[PROFILE UPDATE] Database error:', dbErr);

      // If DB update failed but we uploaded a new avatar, delete the newly uploaded file to avoid orphan
      if (newAvatarPath) {
        try {
          console.log('[AVATAR] Removing newly uploaded avatar due to DB failure:', newAvatarPath);
          await serverSupabase.storage.from('Avatar').remove([newAvatarPath]);
        } catch (cleanupErr) {
          console.error('[AVATAR] Failed to cleanup newly uploaded avatar after DB failure:', cleanupErr);
        }
      }

      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
  } catch (error) {
    console.error('[PATCH] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
