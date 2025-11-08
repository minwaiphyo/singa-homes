import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            phone: true,
            bio: true,
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property details' },
      { status: 500 }
    );
  }
}

// PATCH - Update property
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = params;
    const body = await request.json();

    // Check if user owns this property
    const property = await prisma.property.findUnique({
      where: { id },
      select: { sellerId: true },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    if (property.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only update your own properties' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: any = {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.price !== undefined && { price: Number(body.price) }),
      ...(body.area !== undefined && { area: Number(body.area) }),
      ...(body.bedrooms !== undefined && { 
        bedrooms: body.bedrooms ? Number(body.bedrooms) : null 
      }),
      ...(body.bathrooms !== undefined && { 
        bathrooms: body.bathrooms ? Number(body.bathrooms) : null 
      }),
      ...(body.propertyType !== undefined && { propertyType: body.propertyType }),
      ...(body.listingType !== undefined && { listingType: body.listingType }),
      ...(body.address !== undefined && { address: body.address }),
      ...(body.city !== undefined && { city: body.city }),
      ...(body.state !== undefined && { state: body.state }),
      ...(body.zipCode !== undefined && { zipCode: body.zipCode }),
      ...(body.country !== undefined && { country: body.country }),
      ...(body.leaseYearsLeft !== undefined && { 
        leaseYearsLeft: body.leaseYearsLeft ? Number(body.leaseYearsLeft) : null 
      }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.isFeatured !== undefined && { isFeatured: body.isFeatured }),
      updatedAt: new Date(),
    };

    // Handle images update if provided
    if (body.images && Array.isArray(body.images)) {
      updateData.images = {
        deleteMany: {}, // Delete all existing images
        create: body.images.map((img: any, index: number) => ({
          url: img.url,
          altText: img.altText || null,
          isPrimary: img.isPrimary ?? (index === 0),
          order: img.order ?? index,
        })),
      };
    }

    // Update property
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: updateData,
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json({
      message: 'Property updated successfully',
      property: updatedProperty,
    });
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    );
  }
}

// DELETE property 
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = params;

    // Check if user owns this property
    const property = await prisma.property.findUnique({
      where: { id },
      select: { sellerId: true },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    if (property.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own properties' },
        { status: 403 }
      );
    }

    // Delete property (images will be cascade deleted due to Prisma schema)
    await prisma.property.delete({
      where: { id },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Property deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    );
  }
}
