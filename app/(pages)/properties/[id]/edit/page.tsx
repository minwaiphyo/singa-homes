"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Upload, X, Star, Home, Save, ArrowLeft } from "lucide-react";

interface PropertyImage {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  order: number;
}

export default function EditPropertyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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

  // Existing images from database
  const [existingImages, setExistingImages] = useState<PropertyImage[]>([]);
  // New images to upload
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/sign-in");
      return;
    }

    if (status === "authenticated") {
      fetchProperty();
    }
  }, [status, propertyId]);

  const fetchProperty = async () => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`);
      if (response.ok) {
        const data = await response.json();

        // Check if user is the owner
        if (data.sellerId !== session?.user?.id) {
          setError("You don't have permission to edit this property");
          setTimeout(() => router.push("/my-properties"), 2000);
          return;
        }

        // Populate form data
        setFormData({
          title: data.title,
          description: data.description || "",
          price: data.price.toString(),
          area: data.area.toString(),
          bedrooms: data.bedrooms?.toString() || "",
          bathrooms: data.bathrooms?.toString() || "",
          propertyType: data.propertyType,
          listingType: data.listingType,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
          leaseYearsLeft: data.leaseYearsLeft?.toString() || "",
          isActive: data.isActive,
          isFeatured: data.isFeatured,
        });

        setExistingImages(data.images || []);
      } else {
        setError("Property not found");
        setTimeout(() => router.push("/my-properties"), 2000);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load property");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = e.target;
    const value =
      target.type === "checkbox" && target instanceof HTMLInputElement
        ? target.checked
        : target.value;
    const name = target.name;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle new image file selection
  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith("image/")) {
        setError(`${file.name} is not an image file`);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} is too large (max 5MB)`);
        continue;
      }

      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    const totalImages =
      existingImages.length + newImageFiles.length + validFiles.length;
    if (totalImages > 10) {
      setError("Maximum 10 images allowed");
      return;
    }

    setNewImageFiles([...newImageFiles, ...validFiles]);
    setNewImagePreviews([...newImagePreviews, ...newPreviews]);
    setError("");
  };

  // Remove existing image
  const removeExistingImage = (index: number) => {
    const imageToRemove = existingImages[index];
    setImagesToDelete([...imagesToDelete, imageToRemove.id]);
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  // Remove new image
  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImageFiles(newImageFiles.filter((_, i) => i !== index));
    setNewImagePreviews(newImagePreviews.filter((_, i) => i !== index));
  };

  // Set primary image for existing images
  const setPrimaryExistingImage = (index: number) => {
    const newImages = [...existingImages];
    newImages.forEach((img, i) => {
      img.isPrimary = i === index;
    });
    setExistingImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      // Determine if images are being replaced
      const replaceImages = newImageFiles.length > 0;

      // Validate
      const totalImages = existingImages.length + newImageFiles.length;
      if (totalImages === 0) {
        setError("At least one image is required");
        setIsSaving(false);
        return;
      }

      if (formData.propertyType === "HDB" && !formData.leaseYearsLeft) {
        setError("Lease years left is required for HDB properties");
        setIsSaving(false);
        return;
      }

      // Create FormData object
      const submitData = new FormData();

      // Append property data
      submitData.append("title", formData.title);
      submitData.append("description", formData.description || "");
      submitData.append("price", formData.price);
      submitData.append("area", formData.area);
      submitData.append("bedrooms", formData.bedrooms || "");
      submitData.append("bathrooms", formData.bathrooms || "");
      submitData.append("propertyType", formData.propertyType);
      submitData.append("listingType", formData.listingType);
      submitData.append("address", formData.address);
      submitData.append("city", formData.city);
      submitData.append("state", formData.state);
      submitData.append("zipCode", formData.zipCode);
      submitData.append("country", formData.country);
      submitData.append("leaseYearsLeft", formData.leaseYearsLeft || "");
      submitData.append("isActive", formData.isActive.toString());
      submitData.append("isFeatured", formData.isFeatured.toString());

      // Add replaceImages parameter
      submitData.append("replaceImages", replaceImages.toString());

      // Add deleted images ID
      if (imagesToDelete.length > 0) {
        submitData.append("deletedImageIds", JSON.stringify(imagesToDelete));
      }

      // If replacing images, append new image files
      if (replaceImages) {
        newImageFiles.forEach((file, index) => {
          submitData.append(`image_${index}`, file);
        });
      }

      // Submit to API
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: "PATCH",
        body: submitData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || "Property updated successfully!");

        // Clean up image preview URLs
        newImagePreviews.forEach((preview) => URL.revokeObjectURL(preview));

        setTimeout(() => {
          router.push("/my-properties");
        }, 1500);
      } else {
        setError(data.error || "Failed to update property");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          <div className="flex items-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl mr-4">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Edit Property
              </h1>
              <p className="text-gray-600 mt-1">Update your property details</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Property Images Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Property Images
            </h2>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Current Images ({existingImages.length})
                </p>

                <div className="space-y-2">
                  {existingImages.map((image, index) => {
                    // Extract filename from URL
                    const urlParts = image.url.split("/");
                    const fileName = urlParts[urlParts.length - 1];

                    return (
                      <div
                        key={image.id}
                        className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {image.isPrimary && (
                            <span className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                              Primary
                            </span>
                          )}
                          <span className="text-gray-700 font-medium truncate">
                            {fileName}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {!image.isPrimary && (
                            <button
                              type="button"
                              onClick={() => setPrimaryExistingImage(index)}
                              className="bg-white text-gray-700 border border-gray-300 rounded-lg px-3 py-2 hover:bg-emerald-100 hover:border-emerald-300 transition-all flex items-center gap-1"
                              title="Set as primary"
                            >
                              <Star className="w-4 h-4" />
                              <span className="text-sm">Set Primary</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="bg-red-500 text-white rounded-lg px-3 py-2 hover:bg-red-600 transition-all flex items-center gap-1"
                            title="Remove image"
                          >
                            <X className="w-4 h-4" />
                            <span className="text-sm">Remove</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* New Images */}
            {/* New Images */}
            {newImagePreviews.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  New Images to Upload ({newImagePreviews.length})
                </p>

                <div className="space-y-2">
                  {newImageFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border-2 border-emerald-300 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-all"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span className="bg-emerald-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                          New
                        </span>
                        <span className="text-gray-700 font-medium truncate">
                          {file.name}
                        </span>
                        <span className="text-gray-500 text-sm">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="bg-red-500 text-white rounded-lg px-3 py-2 hover:bg-red-600 transition-all flex items-center gap-1"
                        title="Remove image"
                      >
                        <X className="w-4 h-4" />
                        <span className="text-sm">Remove</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload New Images */}
            <div>
              <label className="cursor-pointer group">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    Add more images
                  </p>
                  <p className="text-sm text-gray-500">
                    JPEG, PNG, or WebP. Max 5MB per image. Total max 10 images.
                  </p>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    onChange={handleNewImageChange}
                    className="hidden"
                  />
                </div>
              </label>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Basic Information
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Property Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Property Type *
                  </label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    required
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                  >
                    <option value="HDB">HDB</option>
                    <option value="CONDO">Condo</option>
                    <option value="LANDED">Landed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Listing Type *
                  </label>
                  <select
                    name="listingType"
                    value={formData.listingType}
                    onChange={handleChange}
                    required
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                  >
                    <option value="SALE">For Sale</option>
                    <option value="RENT">For Rent</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Details */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Pricing & Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price (
                  {formData.listingType === "RENT" ? "per month" : "total"}) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bedrooms
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  min="0"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bathrooms
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  min="0"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                />
              </div>

              {formData.propertyType === "HDB" && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Location</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    required
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Settings</h2>

            <div className="space-y-4">
              <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-all">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-200"
                />
                <span className="ml-3 text-gray-700 font-medium">
                  Active (visible to buyers)
                </span>
              </label>

              <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-all">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-200"
                />
                <span className="ml-3 text-gray-700 font-medium">
                  Featured listing
                </span>
              </label>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
              <p className="text-green-700 font-medium">{success}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-blue-600 text-white text-lg font-semibold py-4 px-6 rounded-xl hover:from-emerald-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Saving changes...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
