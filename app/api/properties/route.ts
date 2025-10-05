import { NextRequest, NextResponse} from "next/server"; 
import { prisma } from "@/lib/prisma"; // Use the singleton instead of creating new instance
import { getSession, useSession } from "next-auth/react";
// import { auth } from "@/lib/auth";




// POST - Create new property
export async function POST(request: NextRequest) {
    try {
        console.log("hereeeeee")
        const body = await request.json();
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
            images,
            } = body;
        
        //Session validation
        const session = await auth();
        


          //Validate active session
          if (!session || !session.user?.id) {
            return NextResponse.json(
              { error: "Unauthorized" },   
                { status: 401 });
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
              latitude: body.latitude,
              longitude: body.longitude,
              leaseYearsLeft: body.leaseYearsLeft,
                isActive: body.isActive,
                isFeatured: body.isFeatured,
                sellerId: session.user.id, // Associate property with logged-in user
                images: { create: images.map((url: string) => ({ url }))}
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



