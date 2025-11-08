import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized. Please sign in to create a listing' },
      { status: 401 }
    )
  };

  try {
    const body = await request.json();

    //Destructure data
      const {
        title,
        description,
        price,
        area,
        bedrooms,
        bathrooms,
        propertyType,
        listingType,
        address,
        city,
        state,
        zipCode,
        country,
        leaseYearsLeft,
        isActive,
        isFeatured,
      } = body;

      const newProperty = await prisma.property.create({
        data: {
          sellerId: session.user.id, 
          title: body.title,
          description: body.description ?? null,
          price: Number(body.price),
          area: Number(body.area),
          bedrooms: body.bedrooms ? Number(body.bedrooms) : null,
          bathrooms: body.bathrooms ? Number(body.bathrooms) : null,
          propertyType: body.propertyType,
          listingType: body.listingType,
          address: body.address,
          city: body.city,
          state: body.state,
          zipCode: body.zipCode,
          country: body.country ?? "Singapore",
          leaseYearsLeft: body.leaseYearsLeft ? Number(body.leaseYearsLeft) : null,
          isActive: body.isActive ?? true,
          isFeatured: body.isFeatured ?? false,
        },
      });
      return NextResponse.json(
        {
          success: true,
          property: newProperty
        },
        { status: 201 }
      );

    } catch (error) {
      console.error('Error creating property:', error);
      return NextResponse.json(
        { error: 'An error occurred while creating the property.' },
        { status: 500 }
      );
    }


    

}

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

    return NextResponse.json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    );
  }
}

// PATCH - Update property
// export async function PATCH(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   const session = await getServerSession(authOptions);

//   if (!session?.user?.id) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   try {
//     const { id } = params;
//     const body = await request.json();

//     // Check if user owns this property
//     const property = await prisma.property.findUnique({
//       where: { id },
//       select: { sellerId: true },
//     });

//     if (!property) {
//       return NextResponse.json(
//         { error: 'Property not found' },
//         { status: 404 }
//       );
//     }

//     if (property.sellerId !== session.user.id) {
//       return NextResponse.json(
//         { error: 'You can only update your own properties' },
//         { status: 403 }
//       );
//     }

//     // Update property
//     const updatedProperty = await prisma.property.update({
//       where: { id },
//       data: {
//         ...(body.title !== undefined && { title: body.title }),
//         ...(body.description !== undefined && { description: body.description }),
//         ...(body.price !== undefined && { price: Number(body.price) }),
//         ...(body.area !== undefined && { area: Number(body.area) }),
//         ...(body.bedrooms !== undefined && { bedrooms: body.bedrooms ? Number(body.bedrooms) : null }),
//         ...(body.bathrooms !== undefined && { bathrooms: body.bathrooms ? Number(body.bathrooms) : null }),
//         ...(body.propertyType !== undefined && { propertyType: body.propertyType }),
//         ...(body.listingType !== undefined && { listingType: body.listingType }),
//         ...(body.address !== undefined && { address: body.address }),
//         ...(body.city !== undefined && { city: body.city }),
//         ...(body.state !== undefined && { state: body.state }),
//         ...(body.zipCode !== undefined && { zipCode: body.zipCode }),
//         ...(body.country !== undefined && { country: body.country }),
//         ...(body.leaseYearsLeft !== undefined && { leaseYearsLeft: body.leaseYearsLeft ? Number(body.leaseYearsLeft) : null }),
//         ...(body.isActive !== undefined && { isActive: body.isActive }),
//         ...(body.isFeatured !== undefined && { isFeatured: body.isFeatured }),
//       },
//       include: {
//         images: true,
//       },
//     });

//     return NextResponse.json(updatedProperty);
//   } catch (error) {
//     console.error('Error updating property:', error);
//     return NextResponse.json(
//       { error: 'Failed to update property' },
//       { status: 500 }
//     );
//   }
// }