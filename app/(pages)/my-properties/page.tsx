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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-white via-emerald-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              My Properties
            </h1>
            <p className="text-gray-600">
              Manage your property listings ({properties.length} total)
            </p>
          </div>
          <button
            onClick={() => router.push("/create-listing")}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-emerald-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold"
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
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No Properties Yet
            </h3>
            <p className="text-gray-600 mb-8">
              Start by creating your first property listing
            </p>
            <button
              onClick={() => router.push("/create-listing")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-emerald-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold"
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
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                {/* Property Image */}
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  {property.images[0] ? (
                    <img
                      src={property.images[0].url}
                      alt={property.images[0].altText || property.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                      <Home className="w-16 h-16 text-gray-400" />
                    </div>
                  )}

                  {/* Status Badges */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {property.isFeatured && (
                      <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-1 text-xs font-bold rounded-full shadow-lg">
                        ⭐ Featured
                      </span>
                    )}
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full shadow-lg ${
                        property.isActive
                          ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white"
                          : "bg-gray-500 text-white"
                      }`}
                    >
                      {property.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2 truncate text-gray-900">
                    {property.title}
                  </h3>

                  <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-3">
                    ${property.price.toLocaleString()}
                    {property.listingType === "RENT" && (
                      <span className="text-sm text-gray-600 font-normal">
                        /month
                      </span>
                    )}
                  </p>

                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-1 text-emerald-600" />
                    <span className="truncate">
                      {property.city}, {property.state}
                    </span>
                  </div>

                  <div className="flex gap-4 text-sm text-gray-700 mb-4 pb-4 border-b border-gray-200">
                    {property.bedrooms !== null && (
                      <span className="font-semibold">{property.bedrooms} bed</span>
                    )}
                    {property.bathrooms !== null && (
                      <span className="font-semibold">{property.bathrooms} bath</span>
                    )}
                    <span className="font-semibold">{property.area} sqft</span>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-700 px-3 py-1 rounded-full font-semibold">
                      {property.propertyType}
                    </span>
                    <div className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                      <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                      <span>{property._count?.favorites || 0}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => router.push(`/properties/${property.id}`)}
                      className="flex items-center justify-center gap-2 px-3 py-2 border-2 border-gray-300 rounded-lg hover:border-emerald-600 hover:text-emerald-600 transition-all text-sm font-semibold text-gray-700"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>

                    <button
                      onClick={() =>
                        router.push(`/properties/${property.id}/edit`)
                      }
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all text-sm font-semibold shadow-md hover:shadow-lg"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        toggleActive(property.id, property.isActive)
                      }
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all text-sm font-semibold shadow-md hover:shadow-lg"
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
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold shadow-md hover:shadow-lg"
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
