import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { get } from 'http';
import { PropertyType, ListingType } from '@/generated/prisma';
import { create } from 'domain';
import { createRequire } from 'module';



export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Check if requesting user's own properties
    const myProperties = searchParams.get('myProperties'); // ?myProperties=true
    const userId = searchParams.get('userId'); // ?userId=123
    
    // Optional filters
    const propertyType = searchParams.get('propertyType');
    const listingType = searchParams.get('listingType');
    const city = searchParams.get('city');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    // If requesting own properties, verify authentication
    if (myProperties === 'true' || userId) {
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: 'Unauthorized. Please sign in.' },
          { status: 401 }
        );
      }

      // If userId is provided, make sure it matches the session
      if (userId && userId !== session.user.id) {
        return NextResponse.json(
          { error: 'Unauthorized. Cannot view other user properties.' },
          { status: 403 }
        );
      }

      // Fetch user's own properties (including inactive ones)
      const userProperties = await prisma.property.findMany({
        where: {
          sellerId: session.user.id,
          ...(propertyType && { propertyType: propertyType as any }),
          ...(listingType && { listingType: listingType as any }),
          ...(city && { city: { contains: city, mode: 'insensitive' } }),
          ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
          ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
        },
        include: {
          images: {
            where: { isPrimary: true },
            take: 1,
          },
          _count: {
            select: {
              favorites: true,
            },
          },
        },
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' },
        ],
      });

      return NextResponse.json(userProperties);
    }

    // Fetch all active properties (public browsing)
    const properties = await prisma.property.findMany({
      where: {
        isActive: true, // Only show active properties to public
        ...(propertyType && { propertyType: propertyType as any }),
        ...(listingType && { listingType: listingType as any }),
        ...(city && { city: { contains: city, mode: 'insensitive' } }),
        ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
        ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
      },
      select: {
        id: true,
        title: true,
        price: true,
        propertyType: true,
        listingType: true,
        city: true,
        state: true,
        bedrooms: true,
        bathrooms: true,
        area: true,
        isFeatured: true,
        createdAt: true,
        images: {
          where: { isPrimary: true },
          take: 1,
          select: {
            url: true,
            altText: true,
          },
        },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

// POST - Updated POST AI (handles Supabase upload + handles cleanup if DB upload fails)
export async function POST(request: NextRequest) {

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized. Please sign in to create a listing' },
      { status: 401 }
    )
  };

  let uploadedFileNames: string[] = [];
  let createdPropertyId: string | null = null;

  try {
    const formData = await request.formData();

    // Extract property data
    const propertyData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string | null,
      price: Number(formData.get('price')),
      area: Number(formData.get('area')),
      bedrooms: formData.get('bedrooms') ? Number(formData.get('bedrooms')) : null,
      bathrooms: formData.get('bathrooms') ? Number(formData.get('bathrooms')) : null,
      propertyType: formData.get('propertyType') as PropertyType,
      listingType: formData.get('listingType') as ListingType,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      zipCode: formData.get('zipCode') as string,
      country: formData.get('country') as string || 'Singapore',
      leaseYearsLeft: formData.get('leaseYearsLeft') ? Number(formData.get('leaseYearsLeft')) : null,
      isActive: formData.get('isActive') === 'true',
      isFeatured: formData.get('isFeatured') === 'true',
    };

     // Validate required fields
    if (!propertyData.title || !propertyData.price || !propertyData.area || !propertyData.address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get image files
    const imageFiles: File[] = [];
    let fileIndex = 0;
    while (formData.has(`image_${fileIndex}`)) {
      const file = formData.get(`image_${fileIndex}`) as File;
      if (file && file.size > 0) {
        imageFiles.push(file);
      }
      fileIndex++;
    }

    // Validate images
    if (imageFiles.length === 0) {
      return NextResponse.json(
        { error: 'At least one property image is required' },
        { status: 400 }
      );
    }

    if (imageFiles.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 images allowed' },
        { status: 400 }
      );
    }

    // Validate image types and sizes
    for (const file of imageFiles) {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { error: `${file.name} is not an image file` },
          { status: 400 }
        );
      }
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: `${file.name} exceeds 5MB limit` },
          { status: 400 }
        );
      }
    }


    // Create new property in database (without images yet)
    const newProperty = await prisma.property.create({
      data: {
        sellerId: session.user.id,
        ...propertyData
      }
    });

    createdPropertyId = newProperty.id;

    // Upload images to Supabase Storage
    const imageRecords: Array<{
      url: string;
      altText: string | null;
      isPrimary: boolean;
      order: number;
    }> = [];

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${newProperty.id}/${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;    
      // Convert File to ArrayBuffer then to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { data, error } = await supabaseAdmin.storage  
        .from('PropertyImages')
        .upload(fileName, buffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw new Error(`Failed to upload image ${file.name}: ${error.message}`);
      }

      uploadedFileNames.push(fileName);

      const {
        data: { publicUrl },
      } = supabaseAdmin.storage.from('PropertyImages').getPublicUrl(fileName);

      imageRecords.push({
        url: publicUrl,
        altText: file.name,
        isPrimary: i === 0, // First image is primary
        order: i,
      });
    }

    // Update property with images
    const updatedProperty = await prisma.property.update({
      where: { id: newProperty.id },
      data: {
        images: {
          create: imageRecords,
        },
      },
      include: {
        images: true,
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,  
          }
        }
      }      
    });

    return NextResponse.json(
      {
        success: true,
        property: updatedProperty
      },
      { status: 201
      }
    )

  } catch (error) {
    console.error('Error creating property:', error); 

    // Cleanup: Delete uploaded images from Supabase if property creation failed
    if (uploadedFileNames.length > 0) {
      try {
        const { error: deleteError } = await supabaseAdmin.storage
          .from('PropertyImages')
          .remove(uploadedFileNames);

        if (deleteError) {
          console.error('Failed to clean up uploaded images:', deleteError);
        } else {
          console.log(`Cleaned up ${uploadedFileNames.length} uploaded images`);
        }
      } catch (cleanupError) {
        console.error('Error during cleanup of uploaded images:', cleanupError);
      }
    }

    // Cleanup: Delete created property from database
    if (createdPropertyId) {
      try {
        await prisma.property.delete({
          where: { id: createdPropertyId},
        });
        console.log(`Deleted property with ID ${createdPropertyId} due to creation failure`);
      } catch (deleteError) {
        console.error('Failed to delete property during cleanup: ', deleteError);
      }
    }

    return NextResponse.json(
      { error: 'An error occurred while creating the property.' },
      { status: 500}
    )
  };
}
