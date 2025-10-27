"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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

  const [imageUrls, setImageUrls] = useState([""]);

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

  const handleImageUrlChange = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  const addImageUrl = () => {
    setImageUrls([...imageUrls, ""]);
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validate images
      const validImages = imageUrls.filter((url) => url.trim() !== "");
      if (validImages.length === 0) {
        setError("At least one image URL is required");
        setIsLoading(false);
        return;
      }
      // Validate HDB lease years
      if (formData.propertyType === "HDB" && !formData.leaseYearsLeft) {
        setError("Lease years left is required for HDB properties");
        setIsLoading(false);
        return;
      }
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
        images: validImages.map((url, index) => ({
          url,
          altText: null,
          isPrimary: index === 0,
          order: index,
        })),
      };
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(propertyData),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess("Property created successfully!");
        setTimeout(() => {
          router.push("/my-properties");
        }, 1500);
      } else {
        setError(data.error || "Failed to create property");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  if (status === "loading") {
    return <div className="p-8">Loading...</div>;
  }
  if (status === "unauthenticated") {
    console.log("User not authenticated, redirecting to sign-in page");
    router.push("/auth/sign-in");
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Create Property Listing</h1>

      <div className="space-y-4">
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Price ({formData.listingType === "RENT" ? "per month" : "total"}) *
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

      <div>
        <label className="block text-sm font-medium mb-1">Image URLs *</label>
        {imageUrls.map((url, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="url"
              value={url}
              onChange={(e) => handleImageUrlChange(index, e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1 border border-gray-300 rounded px-3 py-2"
            />
            {imageUrls.length > 1 && (
              <button
                type="button"
                onClick={() => removeImageUrl(index)}
                className="px-3 py-2 border border-gray-300 rounded"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addImageUrl}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          + Add Another Image
        </button>
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
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? "Creating..." : "Create Listing"}
      </button>
    </div>
  );
}
