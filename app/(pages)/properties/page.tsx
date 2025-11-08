"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

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

export default function PropertiesPage() {
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Browse Properties</h1>
        <p className="text-gray-600">
          Find your dream home from {properties.length} available properties
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Filter Properties</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Property Type */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Property Type
            </label>
            <select
              name="propertyType"
              value={filters.propertyType}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">All Types</option>
              <option value="HDB">HDB</option>
              <option value="CONDO">Condo</option>
              <option value="LANDED">Landed</option>
            </select>
          </div>

          {/* Listing Type */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Listing Type
            </label>
            <select
              name="listingType"
              value={filters.listingType}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">All</option>
              <option value="SALE">For Sale</option>
              <option value="RENT">For Rent</option>
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium mb-2">City</label>
            <input
              type="text"
              name="city"
              value={filters.city}
              onChange={handleFilterChange}
              placeholder="Enter city"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          {/* Min Price */}
          <div>
            <label className="block text-sm font-medium mb-2">Min Price</label>
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              placeholder="0"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-sm font-medium mb-2">Max Price</label>
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              placeholder="Any"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={applyFilters}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="border border-gray-300 px-6 py-2 rounded hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Properties Grid */}
      {properties.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            No properties found matching your criteria
          </p>
          <button
            onClick={clearFilters}
            className="text-blue-600 hover:text-blue-800"
          >
            Clear filters to see all properties
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div
              key={property.id}
              onClick={() => router.push(`/properties/${property.id}`)}
              className="border rounded-lg overflow-hidden shadow hover:shadow-xl transition-shadow cursor-pointer bg-white"
            >
              {/* Property Image */}
              <div className="relative h-48 bg-gray-200 overflow-hidden">
                {property.images && property.images?.[0]?.url ? (
                  <img
                    src={property.images[0].url}
                    alt={property.images[0].altText || property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg
                      className="w-16 h-16"
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
                  <span className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 text-xs font-semibold rounded shadow">
                    ⭐ Featured
                  </span>
                )}
              </div>

              {/* Property Info */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 truncate">
                  {property.title}
                </h3>

                <p className="text-2xl font-bold text-blue-600 mb-2">
                  ${property.price.toLocaleString()}
                  {property.listingType === "RENT" && (
                    <span className="text-sm text-gray-600 font-normal">
                      /month
                    </span>
                  )}
                </p>

                <p className="text-sm text-gray-600 mb-3 flex items-center">
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
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {property.city}, {property.state}
                </p>

                <div className="flex gap-4 text-sm text-gray-700 mb-3">
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

                <div className="flex items-center justify-between">
                  <span className="inline-block text-xs bg-gray-100 px-3 py-1 rounded-full font-medium">
                    {property.propertyType}
                  </span>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      property.listingType === "SALE"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    For {property.listingType === "SALE" ? "Sale" : "Rent"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results Summary */}
      {properties.length > 0 && (
        <div className="mt-8 text-center text-gray-600">
          Showing {properties.length} propert
          {properties.length === 1 ? "y" : "ies"}
        </div>
      )}
    </div>
  );
}
