import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  console.log("Received request to create property listing.");
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