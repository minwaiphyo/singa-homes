import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { PropertyType, ListingType } from '@/generated/prisma';


// GET - Fetch property's details by ID
export async function GET(
  request: NextRequest,
) {
  try {
    const id = request.nextUrl.pathname.split('/').pop();

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

// DELETE property
export async function DELETE(
  request: NextRequest
) {

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = request.nextUrl.pathname.split('/').pop();
    // Check if user owns this property and get image URLs
    const property = await prisma.property.findUnique({
      where: { id },
      select: { 
        sellerId: true,
        images: {
          select: {
            url: true,
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

    if (property.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own properties' },
        { status: 403 }
      );
    }

    // Extract file paths from Supabase URLs
    const imageFilePaths: string[] = [];
    for (const image of property.images) {
      // Extract the file path from the public URL
      // URL format: https://[project-ref].supabase.co/storage/v1/object/public/PropertyImages/propertyimages/[property-id]/[filename]
      const urlParts = image.url.split('/PropertyImages/');
      if (urlParts.length === 2) {
        imageFilePaths.push(urlParts[1]);
      }
    }

    // Delete property from database (images will be cascade deleted due to Prisma schema)
    await prisma.property.delete({
      where: { id },
    });

    // Only delete from Supabase if property deletion was successful
    if (imageFilePaths.length > 0) {
      try {
        const { data, error } = await supabaseAdmin.storage
          .from('PropertyImages')
          .remove(imageFilePaths);
          

        if (error) {
          // Log error but don't fail the request since property is already deleted
          console.error('Failed to delete images from Supabase:', error);
          console.error('Orphaned image paths:', imageFilePaths);
        } else {
          console.log(`Successfully deleted ${imageFilePaths.length} images from Supabase`);
        }
      } catch (storageError) {
        console.error('Error during Supabase cleanup:', storageError);
        console.error('Orphaned image paths:', imageFilePaths);
      }
    }

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


// export async function PATCH(
//   request: NextRequest,
// ) {
//   const session = await getServerSession(authOptions);

//   if (!session?.user?.id) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   let newUploadedFileNames: string[] = [];
//   let imagesToDelete: string[] = [];
//   let shouldReplaceImages = false;

//   try {
//     const id = request.nextUrl.pathname.split('/').pop();

//     // Check if user owns this property
//     const existingProperty = await prisma.property.findUnique({
//       where: { id },
//       select: {
//         sellerId: true,
//         images: {
//           select: {
//             id: true,
//             url: true,
//           },
//         },
//       },
//     });

//     if (!existingProperty) {
//       return NextResponse.json(
//         { error: 'Property not found' },
//         { status: 404 }
//       );
//     }

//     if (existingProperty.sellerId !== session.user.id) {
//       return NextResponse.json(
//         { error: 'You can only edit your own properties' },
//         { status: 403 }
//       );
//     }

//     const formData = await request.formData();

//     // Check if images should be replaced
//     shouldReplaceImages = formData.get('replaceImages') === 'true';

//     // Extract and validate property type
//     const propertyTypeValue = formData.get('propertyType') as string;
//     if (propertyTypeValue && !['HDB', 'CONDO', 'LANDED'].includes(propertyTypeValue)) {
//       return NextResponse.json(
//         { error: 'Invalid property type' },
//         { status: 400 }
//       );
//     }

//     // Extract and validate listing type
//     const listingTypeValue = formData.get('listingType') as string;
//     if (listingTypeValue && !['SALE', 'RENT'].includes(listingTypeValue)) {
//       return NextResponse.json(
//         { error: 'Invalid listing type' },
//         { status: 400 }
//       );
//     }

//     // Build update data object (only include fields that are provided)
//     const updateData: any = {};

//     if (formData.has('title')) updateData.title = formData.get('title') as string;
//     if (formData.has('description')) {
//       const desc = formData.get('description') as string;
//       updateData.description = desc || null;
//     }
//     if (formData.has('price')) updateData.price = Number(formData.get('price'));
//     if (formData.has('area')) updateData.area = Number(formData.get('area'));
//     if (formData.has('bedrooms')) {
//       const bedrooms = formData.get('bedrooms') as string;
//       updateData.bedrooms = bedrooms ? Number(bedrooms) : null;
//     }
//     if (formData.has('bathrooms')) {
//       const bathrooms = formData.get('bathrooms') as string;
//       updateData.bathrooms = bathrooms ? Number(bathrooms) : null;
//     }
//     if (formData.has('propertyType')) {
//       updateData.propertyType = propertyTypeValue as PropertyType;
//     }
//     if (formData.has('listingType')) {
//       updateData.listingType = listingTypeValue as ListingType;
//     }
//     if (formData.has('address')) updateData.address = formData.get('address') as string;
//     if (formData.has('city')) updateData.city = formData.get('city') as string;
//     if (formData.has('state')) updateData.state = formData.get('state') as string;
//     if (formData.has('zipCode')) updateData.zipCode = formData.get('zipCode') as string;
//     if (formData.has('country')) updateData.country = formData.get('country') as string;
//     if (formData.has('leaseYearsLeft')) {
//       const lease = formData.get('leaseYearsLeft') as string;
//       updateData.leaseYearsLeft = lease ? Number(lease) : null;
//     }
//     if (formData.has('isActive')) {
//       updateData.isActive = formData.get('isActive') === 'true';
//     }
//     if (formData.has('isFeatured')) {
//       updateData.isFeatured = formData.get('isFeatured') === 'true';
//     }

//     // Validate HDB lease years
//     if (updateData.propertyType === 'HDB' && formData.has('leaseYearsLeft') && !updateData.leaseYearsLeft) {
//       return NextResponse.json(
//         { error: 'Lease years left is required for HDB properties' },
//         { status: 400 }
//       );
//     }

//     // Handle image replacement if requested
//     if (shouldReplaceImages) {
//       // Get new image files
//       const newImageFiles: File[] = [];
//       let fileIndex = 0;

//       while (true) {
//         const file = formData.get(`image_${fileIndex}`);
//         if (!file || !(file instanceof File)) break;

//         if (file.size > 0) {
//           newImageFiles.push(file);
//         }
//         fileIndex++;
//       }

//       // Validate new images
//       if (newImageFiles.length === 0) {
//         return NextResponse.json(
//           { error: 'At least one property image is required when replacing images' },
//           { status: 400 }
//         );
//       }

//       if (newImageFiles.length > 10) {
//         return NextResponse.json(
//           { error: 'Maximum 10 images allowed' },
//           { status: 400 }
//         );
//       }

//       // Validate image types and sizes
//       for (const file of newImageFiles) {
//         if (!file.type.startsWith('image/')) {
//           return NextResponse.json(
//             { error: `${file.name} is not an image file` },
//             { status: 400 }
//           );
//         }
//         if (file.size > 5 * 1024 * 1024) {
//           return NextResponse.json(
//             { error: `${file.name} exceeds 5MB limit` },
//             { status: 400 }
//           );
//         }
//       }

//       // Extract old image file paths for deletion
//       for (const image of existingProperty.images) {
//         const urlParts = image.url.split('/PropertyImages/');
//         if (urlParts.length === 2) {
//           imagesToDelete.push(urlParts[1]);
//         }
//       }

//       // Upload new images to Supabase
//       const newImageRecords: Array<{
//         url: string;
//         altText: string | null;
//         isPrimary: boolean;
//         order: number;
//       }> = [];

//       for (let i = 0; i < newImageFiles.length; i++) {
//         const file = newImageFiles[i];
//         const fileExt = file.name.split('.').pop();
//         const fileName = `${id}/${Date.now()}-${Math.random()
//           .toString(36)
//           .substring(7)}.${fileExt}`;

//         const arrayBuffer = await file.arrayBuffer();
//         const buffer = Buffer.from(arrayBuffer);

//         const { error } = await supabase.storage
//           .from('PropertyImages')
//           .upload(fileName, buffer, {
//             contentType: file.type,
//             cacheControl: '3600',
//             upsert: false,
//           });

//         if (error) {
//           throw new Error(`Failed to upload image ${file.name}: ${error.message}`);
//         }

//         newUploadedFileNames.push(fileName);

//         const {
//           data: { publicUrl },
//         } = supabase.storage.from('PropertyImages').getPublicUrl(fileName);

//         newImageRecords.push({
//           url: publicUrl,
//           altText: null,
//           isPrimary: i === 0,
//           order: i,
//         });
//       }

//       // Update property with new images (delete old ones and create new ones)
//       updateData.images = {
//         deleteMany: {}, // Delete all existing images
//         create: newImageRecords, // Create new images
//       };
//     }

//     // Update property in database
//     const updatedProperty = await prisma.property.update({
//       where: { id },
//       data: updateData,
//       include: {
//         images: true,
//         seller: {
//           select: {
//             id: true,
//             firstName: true,
//             lastName: true,
//             email: true,
//           },
//         },
//       },
//     });

//     // Delete old images from Supabase storage (only if images were replaced and DB update succeeded)
//     if (shouldReplaceImages && imagesToDelete.length > 0) {
//       try {
//         const { error: deleteError } = await supabase.storage
//           .from('PropertyImages')
//           .remove(imagesToDelete);

//         if (deleteError) {
//           console.error('Failed to delete old images from Supabase:', deleteError);
//           console.error('Orphaned image paths:', imagesToDelete);
//         } else {
//           console.log(`Successfully deleted ${imagesToDelete.length} old images from Supabase`);
//         }
//       } catch (storageError) {
//         console.error('Error during old images cleanup:', storageError);
//       }
//     }

//     return NextResponse.json(
//       {
//         success: true,
//         property: updatedProperty,
//         message: shouldReplaceImages 
//           ? 'Property and images updated successfully' 
//           : 'Property updated successfully',
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error('Error updating property:', error);

//     // Cleanup: Delete newly uploaded images from Supabase if update failed

//     if (shouldReplaceImages && newUploadedFileNames.length > 0) {
//       try {
//         const { error: deleteError } = await supabase.storage
//           .from('PropertyImages')
//           .remove(newUploadedFileNames);

//         if (deleteError) {
//           console.error('Failed to cleanup newly uploaded images:', deleteError);
//         } else {
//           console.log(`Cleaned up ${newUploadedFileNames.length} newly uploaded images`);
//         }
//       } catch (cleanupError) {
//         console.error('Error during new images cleanup:', cleanupError);
//       }
//     }

//     return NextResponse.json(
//       {
//         error: error instanceof Error ? error.message : 'An error occurred while updating the property',
//       },
//       { status: 500 }
//     );
//   }
// }

export async function PATCH(
  request: NextRequest,
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let newUploadedFileNames: string[] = [];
  let imagesToDelete: string[] = [];
  let shouldReplaceImages = false;
  let shouldDeleteSpecificImages = false;

  try {
    const id = request.nextUrl.pathname.split('/').pop();

    // Check if user owns this property
    const existingProperty = await prisma.property.findUnique({
      where: { id },
      select: {
        sellerId: true,
        images: {
          select: {
            id: true,
            url: true,
          },
        },
      },
    });

    if (!existingProperty) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    if (existingProperty.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own properties' },
        { status: 403 }
      );
    }

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      const updateData: { isActive?: boolean; isFeatured?: boolean } = {};

      if (typeof body.isActive === 'boolean') {
        updateData.isActive = body.isActive;
      }

      if (typeof body.isFeatured === 'boolean') {
        updateData.isFeatured = body.isFeatured;
      }

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json(
          { error: 'No supported fields provided for JSON update' },
          { status: 400 }
        );
      }

      const updatedProperty = await prisma.property.update({
        where: { id },
        data: updateData,
        include: {
          images: true,
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return NextResponse.json(
        {
          success: true,
          property: updatedProperty,
          message: 'Property status updated successfully',
        },
        { status: 200 }
      );
    }

    const formData = await request.formData();

    // Check if images should be replaced
    shouldReplaceImages = formData.get('replaceImages') === 'true';

    // Check if specific images should be deleted
    const deletedImageIdsJson = formData.get('deletedImageIds') as string;
    let deletedImageIds: string[] = [];
    if (deletedImageIdsJson) {
      try {
        deletedImageIds = JSON.parse(deletedImageIdsJson);
        shouldDeleteSpecificImages = deletedImageIds.length > 0;
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid deletedImageIds format' },
          { status: 400 }
        );
      }
    }

    // Extract and validate property type
    const propertyTypeValue = formData.get('propertyType') as string;
    if (propertyTypeValue && !['HDB', 'CONDO', 'LANDED'].includes(propertyTypeValue)) {
      return NextResponse.json(
        { error: 'Invalid property type' },
        { status: 400 }
      );
    }

    // Extract and validate listing type
    const listingTypeValue = formData.get('listingType') as string;
    if (listingTypeValue && !['SALE', 'RENT'].includes(listingTypeValue)) {
      return NextResponse.json(
        { error: 'Invalid listing type' },
        { status: 400 }
      );
    }

    // Build update data object (only include fields that are provided)
    const updateData: any = {};

    if (formData.has('title')) updateData.title = formData.get('title') as string;
    if (formData.has('description')) {
      const desc = formData.get('description') as string;
      updateData.description = desc || null;
    }
    if (formData.has('price')) updateData.price = Number(formData.get('price'));
    if (formData.has('area')) updateData.area = Number(formData.get('area'));
    if (formData.has('bedrooms')) {
      const bedrooms = formData.get('bedrooms') as string;
      updateData.bedrooms = bedrooms ? Number(bedrooms) : null;
    }
    if (formData.has('bathrooms')) {
      const bathrooms = formData.get('bathrooms') as string;
      updateData.bathrooms = bathrooms ? Number(bathrooms) : null;
    }
    if (formData.has('propertyType')) {
      updateData.propertyType = propertyTypeValue as PropertyType;
    }
    if (formData.has('listingType')) {
      updateData.listingType = listingTypeValue as ListingType;
    }
    if (formData.has('address')) updateData.address = formData.get('address') as string;
    if (formData.has('city')) updateData.city = formData.get('city') as string;
    if (formData.has('state')) updateData.state = formData.get('state') as string;
    if (formData.has('zipCode')) updateData.zipCode = formData.get('zipCode') as string;
    if (formData.has('country')) updateData.country = formData.get('country') as string;
    if (formData.has('leaseYearsLeft')) {
      const lease = formData.get('leaseYearsLeft') as string;
      updateData.leaseYearsLeft = lease ? Number(lease) : null;
    }
    if (formData.has('isActive')) {
      updateData.isActive = formData.get('isActive') === 'true';
    }
    if (formData.has('isFeatured')) {
      updateData.isFeatured = formData.get('isFeatured') === 'true';
    }

    // Validate HDB lease years
    if (updateData.propertyType === 'HDB' && formData.has('leaseYearsLeft') && !updateData.leaseYearsLeft) {
      return NextResponse.json(
        { error: 'Lease years left is required for HDB properties' },
        { status: 400 }
      );
    }

    // Handle specific image deletion (when user removes existing images without replacing all)
    if (shouldDeleteSpecificImages && !shouldReplaceImages) {
      // Validate that at least one image will remain
      const remainingImageCount = existingProperty.images.length - deletedImageIds.length;
      if (remainingImageCount < 1) {
        return NextResponse.json(
          { error: 'At least one image must remain' },
          { status: 400 }
        );
      }

      // Find the images to delete and extract their storage paths
      const imagesToDeleteFromDb = existingProperty.images.filter(img => 
        deletedImageIds.includes(img.id)
      );

      for (const image of imagesToDeleteFromDb) {
        const urlParts = image.url.split('/PropertyImages/');
        if (urlParts.length === 2) {
          imagesToDelete.push(urlParts[1]);
        }
      }

      // Delete specific images from database
      updateData.images = {
        deleteMany: {
          id: {
            in: deletedImageIds,
          },
        },
      };
    }

    // Handle full image replacement (when user uploads new images)
    if (shouldReplaceImages) {
      // Get new image files
      const newImageFiles: File[] = [];
      let fileIndex = 0;

      while (true) {
        const file = formData.get(`image_${fileIndex}`);
        if (!file || !(file instanceof File)) break;

        if (file.size > 0) {
          newImageFiles.push(file);
        }
        fileIndex++;
      }

      // Validate new images
      if (newImageFiles.length === 0) {
        return NextResponse.json(
          { error: 'At least one property image is required when replacing images' },
          { status: 400 }
        );
      }

      if (newImageFiles.length > 10) {
        return NextResponse.json(
          { error: 'Maximum 10 images allowed' },
          { status: 400 }
        );
      }

      // Validate image types and sizes
      for (const file of newImageFiles) {
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

      // Extract old image file paths for deletion
      for (const image of existingProperty.images) {
        const urlParts = image.url.split('/PropertyImages/');
        if (urlParts.length === 2) {
          imagesToDelete.push(urlParts[1]);
        }
      }

      // Upload new images to Supabase
      const newImageRecords: Array<{
        url: string;
        altText: string | null;
        isPrimary: boolean;
        order: number;
      }> = [];

      for (let i = 0; i < newImageFiles.length; i++) {
        const file = newImageFiles[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${id}/${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${fileExt}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error } = await supabaseAdmin.storage
          .from('PropertyImages')
          .upload(fileName, buffer, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false,
          });

        if (error) {
          throw new Error(`Failed to upload image ${file.name}: ${error.message}`);
        }

        newUploadedFileNames.push(fileName);

        const {
          data: { publicUrl },
        } = supabaseAdmin.storage.from('PropertyImages').getPublicUrl(fileName);

        newImageRecords.push({
          url: publicUrl,
          altText: null,
          isPrimary: i === 0,
          order: i,
        });
      }

      // Update property with new images (delete old ones and create new ones)
      updateData.images = {
        deleteMany: {}, // Delete all existing images
        create: newImageRecords, // Create new images
      };
    }

    // Update property in database
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: updateData,
      include: {
        images: true,
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Delete images from Supabase storage (only if DB update succeeded)
    if (imagesToDelete.length > 0) {
      try {
        const { error: deleteError } = await supabaseAdmin.storage
          .from('PropertyImages')
          .remove(imagesToDelete);

        if (deleteError) {
          console.error('Failed to delete images from Supabase:', deleteError);
          console.error('Orphaned image paths:', imagesToDelete);
        } else {
          console.log(`Successfully deleted ${imagesToDelete.length} images from Supabase`);
        }
      } catch (storageError) {
        console.error('Error during images cleanup:', storageError);
      }
    }

    return NextResponse.json(
      {
        success: true,
        property: updatedProperty,
        message: shouldReplaceImages 
          ? 'Property and images updated successfully' 
          : shouldDeleteSpecificImages
          ? 'Property updated and images removed successfully'
          : 'Property updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating property:', error);

    // Cleanup: Delete newly uploaded images from Supabase if update failed
    if (shouldReplaceImages && newUploadedFileNames.length > 0) {
      try {
          const { error: deleteError } = await supabaseAdmin.storage
            .from('PropertyImages')
            .remove(newUploadedFileNames);

        if (deleteError) {
          console.error('Failed to cleanup newly uploaded images:', deleteError);
        } else {
          console.log(`Cleaned up ${newUploadedFileNames.length} newly uploaded images`);
        }
      } catch (cleanupError) {
        console.error('Error during new images cleanup:', cleanupError);
      }
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An error occurred while updating the property',
      },
      { status: 500 }
    );
  }
}

