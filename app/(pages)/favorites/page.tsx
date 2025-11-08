"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Heart, Home, Trash2, Eye, MapPin, Calendar } from "lucide-react";

interface FavoriteProperty {
  id: string;
  title: string;
  price: number;
  propertyType: string;
  listingType: string;
  city: string;
  state: string;
  address: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number;
  isFeatured: boolean;
  images: { url: string; altText: string | null }[];
  seller: {
    firstName: string;
    lastName: string;
  };
  favoriteId: string;
  favoritedAt: string;
}

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("../auth/sign-in");
      return;
    }

    if (status === "authenticated") {
      fetchFavorites();
    }
  }, [status]);

  const fetchFavorites = async () => {
    try {
      const response = await fetch("/api/favorites");
      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      } else {
        setError("Failed to load favorites");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (propertyId: string) => {
    if (!confirm("Remove this property from favorites?")) {
      return;
    }

    setRemovingId(propertyId);
    try {
      const response = await fetch(`/api/favorites?propertyId=${propertyId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setFavorites(favorites.filter((p) => p.id !== propertyId));
      } else {
        alert("Failed to remove from favorites");
      }
    } catch (err) {
      console.error("Remove error:", err);
      alert("An error occurred");
    } finally {
      setRemovingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl mr-4">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                My Favorite Properties
              </h1>
              <p className="text-gray-600 mt-1">
                Properties you've saved for later ({favorites.length})
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {favorites.length === 0 && !error && (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center border border-gray-100">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
              <Heart className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No Favorites Yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start exploring properties and save your favorites by clicking the
              heart icon on any property listing.
            </p>
            <button
              onClick={() => router.push("/properties")}
              className="inline-flex items-center bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-pink-700 transition-all shadow-lg"
            >
              <Home className="w-5 h-5 mr-2" />
              Browse Properties
            </button>
          </div>
        )}

        {/* Favorites Grid */}
        {favorites.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {favorites.map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-gray-100 group"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Property Image */}
                  <div
                    onClick={() => router.push(`/properties/${property.id}`)}
                    className="relative h-64 md:h-auto md:w-64 bg-gray-200 cursor-pointer flex-shrink-0"
                  >
                    {property.images?.[0]?.url ? (
                      <img
                        src={property.images[0].url}
                        alt={property.images[0].altText || property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="w-16 h-16 text-gray-400" />
                      </div>
                    )}

                    {property.isFeatured && (
                      <span className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        ⭐ Featured
                      </span>
                    )}

                    {/* Favorite Badge */}
                    <div className="absolute top-3 left-3 bg-red-500 text-white rounded-full p-2 shadow-lg">
                      <Heart className="w-4 h-4 fill-white" />
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="flex-1 p-6 flex flex-col">
                    <div className="flex-1">
                      <div
                        onClick={() =>
                          router.push(`/properties/${property.id}`)
                        }
                        className="cursor-pointer"
                      >
                        <h3 className="font-bold text-xl mb-2 text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2">
                          {property.title}
                        </h3>

                        <p className="text-3xl font-bold text-red-600 mb-3">
                          ${property.price.toLocaleString()}
                          {property.listingType === "RENT" && (
                            <span className="text-base text-gray-600 font-normal">
                              /month
                            </span>
                          )}
                        </p>

                        <p className="text-sm text-gray-600 mb-3 flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {property.address}, {property.city}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-700 mb-4">
                          {property.bedrooms !== null && (
                            <span className="flex items-center">
                              <svg
                                className="w-4 h-4 mr-1"
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
                              {property.bedrooms} bed
                            </span>
                          )}
                          {property.bathrooms !== null && (
                            <span className="flex items-center">
                              <svg
                                className="w-4 h-4 mr-1"
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
                              {property.bathrooms} bath
                            </span>
                          )}
                          <span className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
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
                            {property.area} sqft
                          </span>
                        </div>

                        <div className="flex items-center text-xs text-gray-500 mb-3">
                          <Calendar className="w-3 h-3 mr-1" />
                          Saved on {formatDate(property.favoritedAt)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <span className="text-xs bg-gray-100 px-3 py-1 rounded-full font-medium">
                          {property.propertyType}
                        </span>
                        <span className="text-xs text-gray-600">
                          By {property.seller.firstName}{" "}
                          {property.seller.lastName}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <button
                        onClick={() =>
                          router.push(`/properties/${property.id}`)
                        }
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>

                      <button
                        onClick={() => handleRemoveFavorite(property.id)}
                        disabled={removingId === property.id}
                        className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 text-sm font-medium"
                      >
                        {removingId === property.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent"></div>
                            Removing...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        {favorites.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl p-8 text-center text-white shadow-xl">
            <h3 className="text-2xl font-bold mb-3">Found Your Dream Home?</h3>
            <p className="text-red-50 mb-6">
              Contact the sellers and schedule viewings for your favorite
              properties
            </p>
            <button
              onClick={() => router.push("/properties")}
              className="bg-white text-red-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg"
            >
              Discover More Properties
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
