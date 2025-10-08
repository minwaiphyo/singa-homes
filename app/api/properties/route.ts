import { NextRequest, NextResponse} from "next/server"; 
import { prisma } from "@/lib/prisma"; // Use the singleton instead of creating new instance
import { getSession, useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
// import { auth } from "@/lib/auth";


interface CreatePropertyBody {
  title: string;
  description?: string | null;
  price: number;
  area: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  propertyType: 'HDB' | 'CONDO' | 'LANDED';
  listingType: 'SALE' | 'RENT';
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  leaseYearsLeft?: number | null;
  isActive: boolean;
  isFeatured: boolean;
  images: Array<{
    url: string;
    altText?: string | null;
    isPrimary: boolean;
    order: number;
  }>;
}


// POST - Create new property
export async function POST(request: NextRequest) {

    console.log("hereeeeee")

        
      //Session validation
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
      { error: 'Unauthorized. Please sign in.' },
      { status: 401 }
    );
    }
    
    try {
        
      
        const body : CreatePropertyBody = await request.json();


        //Basic validation
        if (!body.title || !body.price || !body.area) {
      return NextResponse.json(
        { error: 'Missing required fields: title, price, area' },
        { status: 400 }
      );
    }

    if (!body.images || body.images.length === 0) {
      return NextResponse.json(
        { error: 'At least one image is required' },
        { status: 400 }
      );
    }

    // HDB validation
    if (body.propertyType === 'HDB' && !body.leaseYearsLeft) {
      return NextResponse.json(
        { error: 'Lease years left is required for HDB properties' },
        { status: 400 }
      );
    }

          //Prisma create property
          const newProperty = await prisma.property.create({
            data: {
              title: body.title,
              description: body.description,
              price: body.price,
              area: body.area,
              bedrooms: body.bedrooms,
              bathrooms: body.bathrooms,
              propertyType: body.propertyType,
              listingType: body.listingType,
              address: body.address,
              city: body.city,
              state: body.state,
              zipCode: body.zipCode,
              country: body.country,
              leaseYearsLeft: body.leaseYearsLeft,
                isActive: body.isActive,
                isFeatured: body.isFeatured,
                sellerId: session.user.id, // Associate property with logged-in user
                images: { 
                  create: body.images.map(img => ({
                    url: img.url,
                    altText: img.altText,
                    isPrimary: img.isPrimary,
                    order: img.order,
                  })),
                }
          }, select: {
            id: true, //Return the id of the newly created property
          }})

            return NextResponse.json(
                {
                    message: 'Property created successfully',
                    property: newProperty
                }, 
                { status: 201 }
            );
        } catch (error) {
            console.error('Error creating property:', error);
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500}
            );
    }
}



