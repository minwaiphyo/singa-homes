"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import FavoriteButton from "@/components/FavoriteButton";
import EditPropertyButton from "@/components/EditPropertyButton";

interface PropertyImage {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  order: number;
}

interface Seller {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  bio: string | null;
  avatar: string | null;
}

interface Property {
  id: string;
  title: string;
  description: string | null;
  price: number;
  area: number;
  bedrooms: number | null;
  bathrooms: number | null;
  propertyType: "HDB" | "CONDO" | "LANDED";
  listingType: "SALE" | "RENT";
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  leaseYearsLeft: number | null;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  sellerId: string;
  images: PropertyImage[];
  seller: Seller;
}

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProperty(params.id as string);
    }
  }, [params.id]);

  const fetchProperty = async (id: string) => {
    try {
      const response = await fetch(`/api/properties/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProperty(data);
      } else {
        setError("Property not found");
      }
    } catch (err) {
      setError("Failed to load property");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this property? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete property");
      }

      alert("Property deleted successfully");
      // Optionally redirect or refresh the page
      router.push("/my-properties");
      // Or refresh the current page: router.refresh();
    } catch (error) {
      console.error("Error deleting property:", error);
      alert(
        error instanceof Error ? error.message : "Failed to delete property"
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isOwner = session?.user?.id === property?.sellerId;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-red-700 mb-2">
            {error || "Property not found"}
          </h2>
          <button
            onClick={() => router.push("/properties")}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            ← Back to Properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
      >
        <svg
          className="w-5 h-5 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back
      </button>

      {/* INSERT IMAGE GALLERY HERE */}
      {/* Image Gallery */}
      <div className="mb-8">
        {/* Main Image Display */}
        <div className="relative h-[400px] md:h-[500px] bg-gray-200 rounded-lg overflow-hidden mb-4">
          {property.images && property.images.length > 0 ? (
            <img
              src={property.images[selectedImage].url}
              alt={property.images[selectedImage].altText || property.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg
                className="w-24 h-24"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {property.isFeatured && (
            <span className="absolute top-4 right-4 bg-yellow-500 text-white px-4 py-2 text-sm font-semibold rounded shadow-lg">
              ⭐ Featured
            </span>
          )}

          {/* Image Counter */}
          {property.images && property.images.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded text-sm">
              {selectedImage + 1} / {property.images.length}
            </div>
          )}

          {/* Navigation Arrows */}
          {property.images && property.images.length > 1 && (
            <>
              <button
                onClick={() =>
                  setSelectedImage(
                    selectedImage === 0
                      ? property.images.length - 1
                      : selectedImage - 1
                  )
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={() =>
                  setSelectedImage(
                    selectedImage === property.images.length - 1
                      ? 0
                      : selectedImage + 1
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Gallery */}
        {property.images && property.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {property.images.map((image, index) => (
              <div
                key={image.id}
                onClick={() => setSelectedImage(index)}
                className={`relative w-24 h-24 flex-shrink-0 cursor-pointer rounded overflow-hidden border-2 transition ${
                  selectedImage === index
                    ? "border-blue-500 shadow-lg"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <img
                  src={image.url}
                  alt={image.altText || `Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {image.isPrimary && (
                  <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                    Primary
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* END IMAGE GALLERY */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Title and Price */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              {property.title}
            </h1>

            <p className="text-4xl font-bold text-blue-600 mb-3">
              ${property.price.toLocaleString()}
              {property.listingType === "RENT" && (
                <span className="text-xl text-gray-600 font-normal">
                  /month
                </span>
              )}
            </p>

            <p className="text-gray-600 flex items-center text-lg">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {property.address}, {property.city}, {property.state}{" "}
              {property.zipCode}
            </p>
          </div>

          {/* Add to Favorites Button */}
          <div className="flex gap-4">
            <FavoriteButton propertyId={property.id} />
            <EditPropertyButton propertyId={property.id} />
          </div>

          {/* Key Features */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Key Features</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {property.bedrooms !== null && (
                <div className="flex items-center">
                  <svg
                    className="w-6 h-6 mr-2 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <div>
                    <p className="text-2xl font-bold">{property.bedrooms}</p>
                    <p className="text-sm text-gray-600">Bedrooms</p>
                  </div>
                </div>
              )}

              {property.bathrooms !== null && (
                <div className="flex items-center">
                  <svg
                    className="w-6 h-6 mr-2 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                    />
                  </svg>
                  <div>
                    <p className="text-2xl font-bold">{property.bathrooms}</p>
                    <p className="text-sm text-gray-600">Bathrooms</p>
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <svg
                  className="w-6 h-6 mr-2 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
                <div>
                  <p className="text-2xl font-bold">{property.area}</p>
                  <p className="text-sm text-gray-600">Sq Ft</p>
                </div>
              </div>

              {property.leaseYearsLeft && (
                <div className="flex items-center">
                  <svg
                    className="w-6 h-6 mr-2 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <div>
                    <p className="text-2xl font-bold">
                      {property.leaseYearsLeft}
                    </p>
                    <p className="text-sm text-gray-600">Years Left</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-white border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Property Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Property Type</p>
                <p className="font-semibold">{property.propertyType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Listing Type</p>
                <p className="font-semibold">
                  For {property.listingType === "SALE" ? "Sale" : "Rent"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Country</p>
                <p className="font-semibold">{property.country}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold">
                  {property.isActive ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-red-600">Inactive</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Listed On</p>
                <p className="font-semibold">
                  {formatDate(property.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-semibold">
                  {formatDate(property.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {property.description ||
                "No description available for this property."}
            </p>
          </div>

          {/* Owner Actions */}
          {isOwner && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">
                Manage Your Listing
              </h3>
              <div className="flex gap-3">
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Edit Property
                </button>
                <button
                  onClick={() => handleDeleteProperty(property.id)}
                  className="border border-red-600 text-red-600 px-4 py-2 rounded hover:bg-red-50"
                >
                  Delete Property
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Seller Contact Card */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-lg p-6 sticky top-4 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">
              {isOwner ? "Your Listing" : "Contact Seller"}
            </h3>

            {/* Seller Info */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                {property.seller.avatar ? (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden mr-3">
                    <Image
                      src={property.seller.avatar}
                      alt={`${property.seller.firstName} ${property.seller.lastName}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <span className="text-2xl font-bold text-blue-600">
                      {property.seller.firstName[0]}
                      {property.seller.lastName[0]}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-lg">
                    {property.seller.firstName} {property.seller.lastName}
                  </p>
                  <p className="text-sm text-gray-600">Property Owner</p>
                </div>
              </div>

              {property.seller.bio && (
                <p className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded">
                  {property.seller.bio}
                </p>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-700">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="break-all">{property.seller.email}</span>
                </div>

                {property.seller.phone && (
                  <div className="flex items-center text-gray-700">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span>{property.seller.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {!isOwner && (
              <div className="space-y-3">
                {session ? (
                  <>
                    <button
                      onClick={() => setShowContactForm(!showContactForm)}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 font-medium"
                    >
                      Send Message
                    </button>
                  </>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">
                      Sign in to contact the seller
                    </p>
                    <button
                      onClick={() => router.push("/auth/sign-in")}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 font-medium"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Contact Form */}
            {showContactForm && !isOwner && (
              <div className="mt-4 pt-4 border-t">
                <textarea
                  placeholder="Write your message here..."
                  rows={4}
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
                />
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
                  Send Message
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
