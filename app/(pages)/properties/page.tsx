"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Search,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Star,
  X,
} from "lucide-react";

interface PropertyBrief {
  id: string;
  title: string;
  price: number;
  propertyType: "HDB" | "CONDO" | "LANDED";
  listingType: "SALE" | "RENT";
  city: string;
  state: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number;
  isFeatured: boolean;
  createdAt: string;
  images: { url: string; altText: string | null }[];
}

function PropertiesForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<PropertyBrief[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter state
  const [filters, setFilters] = useState({
    propertyType: searchParams.get("propertyType") || "",
    listingType: searchParams.get("listingType") || "",
    city: searchParams.get("city") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      // Build query string from filters
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/properties?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      } else {
        setError("Failed to load properties");
      }
    } catch (err) {
      setError("An error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setIsLoading(true);
    fetchProperties();
  };

  const clearFilters = () => {
    setFilters({
      propertyType: "",
      listingType: "",
      city: "",
      minPrice: "",
      maxPrice: "",
    });
    setIsLoading(true);
    setTimeout(() => fetchProperties(), 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-white via-emerald-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
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
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Browse Properties
            </h1>
            <p className="text-xl md:text-2xl text-white text-opacity-90">
              Find your dream home from{" "}
              <span className="font-semibold text-yellow-300">
                {properties.length}
              </span>{" "}
              available properties
            </p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-gradient-to-b from-white via-emerald-50 to-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <Search className="w-6 h-6 text-emerald-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Filter Properties
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {/* Property Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Property Type
                </label>
                <select
                  name="propertyType"
                  value={filters.propertyType}
                  onChange={handleFilterChange}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                >
                  <option value="">All Types</option>
                  <option value="HDB">HDB</option>
                  <option value="CONDO">Condo</option>
                  <option value="LANDED">Landed</option>
                </select>
              </div>

              {/* Listing Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Listing Type
                </label>
                <select
                  name="listingType"
                  value={filters.listingType}
                  onChange={handleFilterChange}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                >
                  <option value="">All</option>
                  <option value="SALE">For Sale</option>
                  <option value="RENT">For Rent</option>
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={filters.city}
                  onChange={handleFilterChange}
                  placeholder="Enter city"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                />
              </div>

              {/* Min Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Min Price
                </label>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="0"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Price
                </label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="Any"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-3">
              <button
                onClick={applyFilters}
                className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 text-white font-semibold px-8 py-3 rounded-lg hover:from-emerald-700 hover:via-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="border-2 border-gray-300 text-gray-700 font-semibold px-8 py-3 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Properties Grid */}
          {properties.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100 max-w-md mx-auto">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-6 font-medium">
                  No properties found matching your criteria
                </p>
                <button
                  onClick={clearFilters}
                  className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                >
                  Clear filters to see all properties
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {properties.map((property) => (
                <div
                  key={property.id}
                  onClick={() => router.push(`/properties/${property.id}`)}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 cursor-pointer group"
                >
                  {/* Property Image */}
                  <div className="relative h-56 bg-gray-200 overflow-hidden">
                    {property.images && property.images?.[0]?.url ? (
                      <img
                        src={property.images[0].url}
                        alt={property.images[0].altText || property.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                        <MapPin className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    {property.isFeatured && (
                      <span className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-4 py-2 text-sm font-bold rounded-full shadow-lg flex items-center gap-1">
                        <Star className="w-4 h-4 fill-current" />
                        Featured
                      </span>
                    )}
                    <span className="absolute top-4 left-4 bg-white text-gray-900 px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                      {property.propertyType}
                    </span>
                  </div>

                  {/* Property Info */}
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors">
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

                    <div className="flex items-center gap-1 text-gray-700 mb-4 font-medium">
                      <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="text-sm">
                        {property.city}, {property.state}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-4 pb-4 border-t border-b border-gray-200 mb-4">
                      {property.bedrooms !== null && (
                        <div className="flex flex-col items-center">
                          <Bed className="w-5 h-5 text-emerald-600 mb-1" />
                          <span className="text-sm font-semibold text-gray-900">
                            {property.bedrooms}
                          </span>
                          <span className="text-xs text-gray-500">Beds</span>
                        </div>
                      )}
                      {property.bathrooms !== null && (
                        <div className="flex flex-col items-center">
                          <Bath className="w-5 h-5 text-emerald-600 mb-1" />
                          <span className="text-sm font-semibold text-gray-900">
                            {property.bathrooms}
                          </span>
                          <span className="text-xs text-gray-500">Baths</span>
                        </div>
                      )}
                      <div className="flex flex-col items-center">
                        <Maximize2 className="w-5 h-5 text-emerald-600 mb-1" />
                        <span className="text-sm font-semibold text-gray-900">
                          {property.area}
                        </span>
                        <span className="text-xs text-gray-500">sqft</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="inline-block bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-700 px-4 py-2 rounded-full text-xs font-bold">
                        {property.listingType === "SALE"
                          ? "For Sale"
                          : "For Rent"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results Summary */}
          {properties.length > 0 && (
            <div className="text-center">
              <p className="text-gray-600 font-medium">
                Showing{" "}
                <span className="text-emerald-600 font-bold">
                  {properties.length}
                </span>{" "}
                propert{properties.length === 1 ? "y" : "ies"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-white via-emerald-50 to-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      }
    >
      <PropertiesForm />
    </Suspense>
  );
}