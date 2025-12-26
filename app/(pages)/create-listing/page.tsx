"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Upload,
  X,
  Star,
  Home,
  DollarSign,
  MapPin,
  Camera,
  ArrowRight,
} from "lucide-react";

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

  // Image Upload State — previews removed, only keep files
  const [imageFiles, setImageFiles] = useState<File[]>([]);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
    if (!filesList || filesList.length === 0) return;

    const filesArray = Array.from(filesList);
    const validFiles: File[] = [];

    for (const file of filesArray) {
      if (!file.type.startsWith("image/")) {
        setError(`${file.name} is not an image file`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} is too large (max 5MB)`);
        continue;
      }

      validFiles.push(file);
    }

    if (imageFiles.length + validFiles.length > 10) {
      setError("Maximum 10 images allowed");
      return;
    }

    setImageFiles((prev) => [...prev, ...validFiles]);
    setError("");
    // Clear the input value so same file can be selected again if needed
    e.currentTarget.value = "";
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const setPrimaryImage = (index: number) => {
    const newFiles = [...imageFiles];
    const [file] = newFiles.splice(index, 1);
    newFiles.unshift(file);
    setImageFiles(newFiles);
  };

  const clearForm = () => {
    setFormData({
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
    setImageFiles([]);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (imageFiles.length === 0) {
        setError("At least one property image is required");
        setIsLoading(false);
        return;
      }

      if (formData.propertyType === "HDB" && !formData.leaseYearsLeft) {
        setError("Lease years left is required for HDB properties");
        setIsLoading(false);
        return;
      }

      const submitData = new FormData();

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

      // Append image files (primary is imageFiles[0])
      imageFiles.forEach((file, index) => {
        submitData.append(`image_${index}`, file);
      });

      // Submit to API
      const response = await fetch("/api/properties", {
        method: "POST",
        body: submitData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create property");
        setIsLoading(false);
        return;
      }

      setSuccess("Property created successfully!");

      // Clear the form
      clearForm();

      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push("/my-properties");
      }, 1500);
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-white via-emerald-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-600 text-white overflow-hidden pt-20 pb-24">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white opacity-5 rounded-full -ml-36 mb-0"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">List Your Property</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Create Property Listing
            </h1>
            <p className="text-xl md:text-2xl text-white text-opacity-90">
              Fill in the details to showcase your property to buyers
            </p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Property Images Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <Camera className="w-6 h-6 text-emerald-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">
                Property Images *
              </h2>
            </div>

            <div className="mb-6">
              <label className="cursor-pointer group">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    {imageFiles.length === 0
                      ? "Click to upload images"
                      : "Add more images"}
                  </p>
                  <p className="text-sm text-gray-500">
                    JPEG, PNG, or WebP. Max 5MB per image. Up to 10 images.
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    disabled={imageFiles.length >= 10 || isLoading}
                    className="hidden"
                  />
                </div>
              </label>
            </div>

            {imageFiles.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-4">
                  Selected Images ({imageFiles.length}/10)
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {imageFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="relative w-full rounded-xl overflow-hidden border-2 border-gray-200 shadow-md p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-sm font-medium text-gray-600">
                            {file.name.split(".").pop()?.toUpperCase() || "IMG"}
                          </div>
                          <div className="text-left">
                            <div
                              className="font-medium text-gray-800 truncate"
                              title={file.name}
                            >
                              {file.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {(file.size / 1024).toFixed(0)} KB ·{" "}
                              {file.type || "image"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {index !== 0 && (
                            <button
                              type="button"
                              onClick={() => setPrimaryImage(index)}
                              disabled={isLoading}
                              className="bg-white text-gray-700 rounded-full p-2 hover:bg-emerald-100 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Set as primary"
                            >
                              <Star className="w-5 h-5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            disabled={isLoading}
                            className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Remove image"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {index === 0 && (
                          <span className="absolute top-3 left-3 bg-gradient-to-r from-emerald-500 to-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
                            Primary
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <Home className="w-6 h-6 text-emerald-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">
                Basic Information
              </h2>
            </div>

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
                  disabled={isLoading}
                  placeholder="e.g., Spacious 3-Bedroom HDB in Jurong"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={isLoading}
                  placeholder="Describe your property..."
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={isLoading}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={isLoading}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="flex items-center mb-6">
              <DollarSign className="w-6 h-6 text-emerald-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">
                Pricing & Details
              </h2>
            </div>

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
                  disabled={isLoading}
                  min="0"
                  step="0.01"
                  placeholder="500000"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={isLoading}
                  min="0"
                  step="0.01"
                  placeholder="1000"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={isLoading}
                  min="0"
                  placeholder="3"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={isLoading}
                  min="0"
                  placeholder="2"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={isLoading}
                    min="1"
                    max="99"
                    placeholder="90"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <MapPin className="w-6 h-6 text-emerald-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Location</h2>
            </div>

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
                  disabled={isLoading}
                  placeholder="123 Main Street"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={isLoading}
                    placeholder="Singapore"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={isLoading}
                    placeholder="Singapore"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={isLoading}
                    placeholder="123456"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={isLoading}
                  placeholder="Singapore"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Settings</h2>

            <div className="space-y-4">
              <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="ml-3 text-gray-700 font-medium">
                  Active (visible to buyers)
                </span>
              </label>

              {/* <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="ml-3 text-gray-700 font-medium">
                  Featured listing
                </span>
              </label> */}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 text-white text-lg font-semibold py-4 px-6 rounded-xl hover:from-emerald-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            {isLoading ? "Creating property..." : "Create Listing"}
            {!isLoading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
