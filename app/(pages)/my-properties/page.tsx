"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Home,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Heart,
  MapPin,
  DollarSign,
} from "lucide-react";

interface PropertyImage {
  url: string;
  altText: string | null;
}

interface MyProperty {
  id: string;
  title: string;
  price: number;
  propertyType: "HDB" | "CONDO" | "LANDED";
  listingType: "SALE" | "RENT";
  city: string;
  state: string;
  address: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  images: PropertyImage[];
  _count?: {
    favorites: number;
  };
}

export default function MyPropertiesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [properties, setProperties] = useState<MyProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      fetchMyProperties();
    }
  }, [status]);

  const fetchMyProperties = async () => {
    try {
      const response = await fetch("/api/properties?myProperties=true");
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      } else {
        setError("Failed to load properties");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (propertyId: string) => {
    if (!confirm("Are you sure you want to delete this property?")) {
      return;
    }

    setDeletingId(propertyId);
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProperties(properties.filter((p) => p.id !== propertyId));
      } else {
        alert("Failed to delete property");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("An error occurred while deleting");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleActive = async (propertyId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        setProperties(
          properties.map((p) =>
            p.id === propertyId ? { ...p, isActive: !currentStatus } : p
          )
        );
      } else {
        alert("Failed to update property status");
      }
    } catch (err) {
      console.error("Toggle active error:", err);
      alert("An error occurred");
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Properties
            </h1>
            <p className="text-gray-600">
              Manage your property listings ({properties.length} total)
            </p>
          </div>
          <button
            onClick={() => router.push("/create-listing")}
            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors shadow-md"
          >
            <Plus className="w-5 h-5" />
            Create New Listing
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {properties.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Properties Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start by creating your first property listing
            </p>
            <button
              onClick={() => router.push("/create-listing")}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Listing
            </button>
          </div>
        )}

        {/* Properties Grid */}
        {properties.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Property Image */}
                <div className="relative h-48 bg-gray-200">
                  {property.images[0] ? (
                    <img
                      src={property.images[0].url}
                      alt={property.images[0].altText || property.title}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="w-16 h-16 text-gray-400" />
                    </div>
                  )}

                  {/* Status Badges */}
                  <div className="absolute top-2 right-2 flex gap-2">
                    {property.isFeatured && (
                      <span className="bg-yellow-500 text-white px-2 py-1 text-xs font-semibold rounded shadow">
                        ⭐ Featured
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded shadow ${
                        property.isActive
                          ? "bg-green-500 text-white"
                          : "bg-gray-500 text-white"
                      }`}
                    >
                      {property.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 truncate">
                    {property.title}
                  </h3>

                  <p className="text-2xl font-bold text-emerald-600 mb-3">
                    ${property.price.toLocaleString()}
                    {property.listingType === "RENT" && (
                      <span className="text-sm text-gray-600 font-normal">
                        /month
                      </span>
                    )}
                  </p>

                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="truncate">
                      {property.city}, {property.state}
                    </span>
                  </div>

                  <div className="flex gap-4 text-sm text-gray-700 mb-3">
                    {property.bedrooms !== null && (
                      <span>{property.bedrooms} bed</span>
                    )}
                    {property.bathrooms !== null && (
                      <span>{property.bathrooms} bath</span>
                    )}
                    <span>{property.area} sqft</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {property.propertyType}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>{property._count?.favorites || 0}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => router.push(`/properties/${property.id}`)}
                      className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>

                    <button
                      onClick={() =>
                        router.push(`/properties/${property.id}/edit`)
                      }
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>

                    <button
                      onClick={() => toggleActive(property.id, property.isActive)}
                      className="flex items-center justify-center gap-2 px-3 py-2 border border-emerald-600 text-emerald-600 rounded hover:bg-emerald-50 transition-colors text-sm"
                    >
                      {property.isActive ? (
                        <>
                          <EyeOff className="w-4 h-4" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          Activate
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(property.id)}
                      disabled={deletingId === property.id}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
                    >
                      {deletingId === property.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}