"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Home,
  MapPin,
  DollarSign,
  Ruler,
  Bed,
  Bath,
  Car,
  Calendar,
  Upload,
  Plus,
  X,
  Check,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

const PROPERTY_TYPES = ["HDB", "CONDO", "LANDED"];

const LISTING_TYPES = ["SALE", "RENT"];

interface FormData {
  title: string;
  description: string;

  propertyType: string;
  listingType: string;

  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;

  price: string;

  area: string;
  bedrooms: string;
  bathrooms: string;
  leaseYearsLeft: string; // For HDB properties only

  isActive: boolean;
  isFeatured: boolean;
}

interface ImageData {
  url: string;
  altText: string;
  isPrimary: boolean;
}

const STEPS = [
  {
    id: 1,
    title: "Basic Info",
    description: "Property type and listing details",
  },
  { id: 2, title: "Location", description: "Address and location information" },
  {
    id: 3,
    title: "Details",
    description: "Price, size, and property features",
  },
  { id: 4, title: "Images", description: "Upload property photos" },
  { id: 5, title: "Review", description: "Review and submit your listing" },
];

export default function CreateListingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState<FormData>({
    // Basic Info
    title: "",
    description: "",
    propertyType: "HDB",
    listingType: "SALE",

    // Location
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Singapore",

    // Details
    price: "",
    area: "",
    bedrooms: "",
    bathrooms: "",
    leaseYearsLeft: "", // For HDB only

    // Status
    isActive: true,
    isFeatured: false,
  });

  const [images, setImages] = useState<ImageData[]>([]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status, router]);

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
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
    if (error) setError("");
  };

  const handleImageAdd = () => {
    if (images.length < 10) {
      setImages((prev) => [
        ...prev,
        { url: "", altText: "", isPrimary: prev.length === 0 },
      ]);
    }
  };

  const handleImageChange = (
    index: number,
    field: keyof ImageData,
    value: string
  ) => {
    setImages((prev) =>
      prev.map((img, i) =>
        i === index
          ? { ...img, [field]: field === "isPrimary" ? Boolean(value) : value }
          : img
      )
    );
  };

  const handleImageRemove = (index: number) => {
    setImages((prev) => {
      const newImages = prev.filter((_, i) => i !== index);
      // If we removed the primary image, make the first one primary
      if (prev[index].isPrimary && newImages.length > 0) {
        newImages[0].isPrimary = true;
      }
      return newImages;
    });
  };

  const setPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (
          !formData.title ||
          !formData.propertyType ||
          !formData.listingType
        ) {
          setError("Please fill in all required fields");
          return false;
        }
        break;
      case 2:
        if (
          !formData.address ||
          !formData.city ||
          !formData.state ||
          !formData.zipCode
        ) {
          setError("Please fill in all location fields");
          return false;
        }
        break;
      case 3:
        if (!formData.price || !formData.area) {
          setError("Price and area are required");
          return false;
        }
        if (parseFloat(formData.price) <= 0 || parseFloat(formData.area) <= 0) {
          setError("Price and area must be positive numbers");
          return false;
        }
        // Validate HDB lease years if HDB property type
        if (formData.propertyType === "HDB") {
          if (!formData.leaseYearsLeft) {
            setError("Lease years left is required for HDB properties");
            return false;
          }
          const leaseYears = parseInt(formData.leaseYearsLeft);
          if (leaseYears < 1 || leaseYears > 99) {
            setError("Lease years left must be between 1 and 99");
            return false;
          }
        }
        break;
      case 4:
        if (images.length === 0) {
          setError("Please add at least one image");
          return false;
        }
        if (images.some((img) => !img.url)) {
          setError("Please provide URLs for all images");
          return false;
        }
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
      setError("");
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError("");
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    setError("");

    try {
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
        sellerId: session?.user.id,

        images: images.map((img, index) => ({
          url: img.url,
          altText: img.altText || null,
          isPrimary: img.isPrimary,
          order: index,
        })),
      };

      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(propertyData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Listing created successfully!");
        setTimeout(() => {
          router.push("/my-properties");
        }, 2000);
      } else {
        setError(data.error || "Failed to create listing");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (status == "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status == "unauthenticated") {
    router.push("/api/auth/signin");
    return null;
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Beautiful 3BR House with seaview"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your property..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type *
                </label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {PROPERTY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0) + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Listing Type *
                </label>
                <select
                  name="listingType"
                  value={formData.listingType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {LISTING_TYPES.map((type) => (
                    <option key={type} value={type}>
                      For {type.charAt(0) + type.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123 Main Street"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Singapore"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Singapore"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (
                  {formData.listingType === "RENT" ? "per month" : "total"}) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="250000"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area (sq ft) *
                </label>
                <div className="relative">
                  <Ruler className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1200"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms
                </label>
                <div className="relative">
                  <Bed className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="3"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms
                </label>
                <div className="relative">
                  <Bath className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="2"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* HDB-specific field */}
            {formData.propertyType === "HDB" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lease Years Left *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="leaseYearsLeft"
                    value={formData.leaseYearsLeft}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="85"
                    min="1"
                    max="99"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Number of years remaining on the HDB lease
                </p>
              </div>
            )}

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Listing Options
              </label>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-gray-700">
                    Active (visible to buyers)
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-gray-700">Featured listing</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Property Images
              </h3>
              <button
                type="button"
                onClick={handleImageAdd}
                disabled={images.length >= 10}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                <span>Add Image</span>
              </button>
            </div>

            {images.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500">No images added yet</p>
                <p className="text-sm text-gray-400">
                  Click "Add Image" to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="border border-gray-300 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        Image {index + 1}
                        {image.isPrimary && (
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            Primary
                          </span>
                        )}
                      </span>
                      <div className="flex space-x-2">
                        {!image.isPrimary && (
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(index)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Set as Primary
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleImageRemove(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <input
                        type="url"
                        placeholder="Image URL"
                        value={image.url}
                        onChange={(e) =>
                          handleImageChange(index, "url", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Alt text (optional)"
                        value={image.altText}
                        onChange={(e) =>
                          handleImageChange(index, "altText", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">
              Review Your Listing
            </h3>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">{formData.title}</h4>
                <p className="text-gray-600">{formData.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Type:</span>{" "}
                  {formData.propertyType}
                </div>
                <div>
                  <span className="font-medium">For:</span>{" "}
                  {formData.listingType}
                </div>
                <div>
                  <span className="font-medium">Price:</span> ${formData.price}
                </div>
                <div>
                  <span className="font-medium">Area:</span> {formData.area} sq
                  ft
                </div>
              </div>

              <div className="text-sm">
                <span className="font-medium">Address:</span> {formData.address}
                , {formData.city}, {formData.state} {formData.zipCode}
              </div>

              <div className="text-sm">
                <span className="font-medium">Images:</span> {images.length}{" "}
                uploaded
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Link
              href="/my-properties"
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Create Property Listing
              </h1>
              <p className="text-gray-600">
                Fill in the details to create your property listing
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`
                  flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                  ${
                    currentStep > step.id
                      ? "bg-green-600 text-white"
                      : currentStep === step.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-300 text-gray-600"
                  }
                `}
                >
                  {currentStep > step.id ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p
                    className={`text-sm font-medium ${
                      currentStep >= step.id ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`ml-4 w-12 h-0.5 ${
                      currentStep > step.id ? "bg-green-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {renderStep()}

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentStep === STEPS.length ? (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Create Listing</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
