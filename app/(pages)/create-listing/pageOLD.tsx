"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function CreateListingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    area: "",
    bedrooms: "",
    bathrooms: "",
    propertyType: "HDB",
    listingType: "SALE",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Singapore",
    leaseYearsLeft: "",
    isActive: true,
    isFeatured: false,
  });

  // Image Upload State
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = e.target;
    const value =
      target.type === "checkbox"
        ? (target as HTMLInputElement).checked
        : target.value;
    const name = target.name;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle multiple image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validate each file
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError(`${file.name} is not an image file`);
        continue;
      }

      // Validate file size (5MB max per image)
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} is too large (max 5MB)`);
        continue;
      }

      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    // Check total number of images (max 10)
    if (imageFiles.length + validFiles.length > 10) {
      setError("Maximum 10 images allowed");
      return;
    }

    setImageFiles([...imageFiles, ...validFiles]);
    setImagePreviews([...imagePreviews, ...newPreviews]);
    setError("");
  };

  // Remove an image
  const removeImage = (index: number) => {
    // Clean up preview URL
    URL.revokeObjectURL(imagePreviews[index]);

    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  // Set primary image (move to first position)
  const setPrimaryImage = (index: number) => {
    const newFiles = [...imageFiles];
    const newPreviews = [...imagePreviews];

    const [file] = newFiles.splice(index, 1);
    const [preview] = newPreviews.splice(index, 1);

    newFiles.unshift(file);
    newPreviews.unshift(preview);

    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  // Upload images to Supabase Storage
  const uploadImages = async (propertyId: string): Promise<string[]> => {
    if (imageFiles.length === 0) return [];

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        setUploadProgress(
          `Uploading image ${i + 1} of ${imageFiles.length}...`
        );

        // Create unique filename with propertyId
        const fileExt = file.name.split(".").pop();
        const fileName = `propertyimages/${propertyId}/${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${fileExt}`;

        // Upload to Supabase
        const { data, error } = await supabase.storage
          .from("PropertyImages")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          continue;
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("PropertyImages").getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      setUploadProgress(`Successfully uploaded ${uploadedUrls.length} images!`);
      return uploadedUrls;
    } catch (error) {
      console.error("Upload error:", error);
      return [];
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validate images
      if (imageFiles.length === 0) {
        setError("At least one property image is required");
        setIsLoading(false);
        return;
      }

      // Validate HDB lease years
      if (formData.propertyType === "HDB" && !formData.leaseYearsLeft) {
        setError("Lease years left is required for HDB properties");
        setIsLoading(false);
        return;
      }

      // Step 1: Create property WITHOUT images first
      const propertyData = {
        title: formData.title,
        description: formData.description || null,
        price: parseFloat(formData.price),
        area: parseFloat(formData.area),
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        propertyType: formData.propertyType,
        listingType: formData.listingType,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        leaseYearsLeft:
          formData.propertyType === "HDB" && formData.leaseYearsLeft
            ? parseInt(formData.leaseYearsLeft)
            : null,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        images: [], // Empty initially
      };

      const response = await fetch("/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(propertyData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create property");
        setIsLoading(false);
        return;
      }

      const propertyId = data.property.id;

      // Step 2: Now upload images with propertyId
      const imageUrls = await uploadImages(propertyId);

      if (imageUrls.length === 0) {
        // Property created but images failed
        setError(
          "Property created but image upload failed. Please edit the property to add images."
        );
        setTimeout(() => router.push(`/properties/${propertyId}/edit`), 2000);
        return;
      }

      // Step 3: Update property with image URLs
      const updateResponse = await fetch(`/api/properties/${propertyId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          images: imageUrls.map((url, index) => ({
            url,
            altText: null,
            isPrimary: index === 0,
            order: index,
          })),
        }),
      });

      if (!updateResponse.ok) {
        setError(
          "Property created but failed to attach images. Please edit to add images."
        );
        setTimeout(() => router.push(`/properties/${propertyId}/edit`), 2000);
        return;
      }

      setSuccess("Property created successfully!");
      setTimeout(() => {
        router.push("/my-properties");
      }, 1500);
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
      setUploadProgress("");
    }
  };

  if (status === "loading") {
    return <div className="p-8">Loading...</div>;
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Create Property Listing</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        {/* Property Images Section */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Property Images * (Max 10)
          </label>

          {/* File Upload Input */}
          <div className="mb-4">
            <label className="cursor-pointer inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Upload className="w-5 h-5 mr-2" />
              {imageFiles.length === 0 ? "Upload Images" : "Add More Images"}
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={handleImageChange}
                disabled={uploadingImages || imageFiles.length >= 10}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">
              JPEG, PNG, or WebP. Max 5MB per image. First image will be the
              primary image.
            </p>

            {uploadProgress && (
              <div className="mt-2 flex items-center text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
                <span className="text-sm">{uploadProgress}</span>
              </div>
            )}
          </div>

          {/* Image Previews Grid */}
          {imagePreviews.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-3">
                Selected Images ({imagePreviews.length}/10)
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-gray-300">
                      <Image
                        src={preview}
                        alt={`Property image ${index + 1}`}
                        fill
                        className="object-cover"
                      />

                      {/* Primary Badge */}
                      {index === 0 && (
                        <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          Primary
                        </span>
                      )}

                      {/* Action Buttons */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center gap-2">
                        {index !== 0 && (
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(index)}
                            className="opacity-0 group-hover:opacity-100 bg-white text-gray-700 rounded-full p-2 hover:bg-gray-100 transition-opacity"
                            title="Set as primary"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-opacity"
                          title="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Property Type & Listing Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Property Type *
            </label>
            <select
              name="propertyType"
              value={formData.propertyType}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="HDB">HDB</option>
              <option value="CONDO">Condo</option>
              <option value="LANDED">Landed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Listing Type *
            </label>
            <select
              name="listingType"
              value={formData.listingType}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="SALE">For Sale</option>
              <option value="RENT">For Rent</option>
            </select>
          </div>
        </div>

        {/* Price & Area */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Price ({formData.listingType === "RENT" ? "per month" : "total"})
              *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Area (sq ft) *
            </label>
            <input
              type="number"
              name="area"
              value={formData.area}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Bedrooms & Bathrooms */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Bedrooms</label>
            <input
              type="number"
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleChange}
              min="0"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Bathrooms</label>
            <input
              type="number"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
              min="0"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
        </div>

        {/* HDB Lease Years */}
        {formData.propertyType === "HDB" && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Lease Years Left *
            </label>
            <input
              type="number"
              name="leaseYearsLeft"
              value={formData.leaseYearsLeft}
              onChange={handleChange}
              required={formData.propertyType === "HDB"}
              min="1"
              max="99"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
        )}

        {/* Address */}
        <div>
          <label className="block text-sm font-medium mb-1">Address *</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        {/* City, State, Zip */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">City *</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">State *</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">ZIP Code *</label>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium mb-1">Country</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        {/* Checkboxes */}
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="mr-2"
            />
            <span className="text-sm">Active (visible to buyers)</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
              className="mr-2"
            />
            <span className="text-sm">Featured listing</span>
          </label>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            {success}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || uploadingImages}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading
            ? uploadingImages
              ? "Uploading images..."
              : "Creating property..."
            : "Create Listing"}
        </button>
      </form>
    </div>
  );
}
