"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

// Add this inside your PropertyDetailPage component
const FavoriteButton = ({ propertyId }: { propertyId: string }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if property is already favorited on mount
  useEffect(() => {
    if (session?.user?.id) {
      checkFavoriteStatus();
    }
  }, [session, propertyId]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(`/api/favorites/${propertyId}`);
      if (response.ok) {
        const data = await response.json();
        setIsFavorited(data.isFavorited);
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  const handleToggleFavorite = async () => {
    // Redirect to sign in if not authenticated
    if (!session?.user?.id) {
      router.push("/auth/sign-in");
      return;
    }

    setIsLoading(true);

    try {
      if (isFavorited) {
        // Remove from favorites
        const response = await fetch(
          `/api/favorites?propertyId=${propertyId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          setIsFavorited(false);
        } else {
          const data = await response.json();
          alert(data.error || "Failed to remove from favorites");
        }
      } else {
        // Add to favorites
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ propertyId }),
        });

        if (response.ok) {
          setIsFavorited(true);
        } else {
          const data = await response.json();
          alert(data.error || "Failed to add to favorites");
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
        isFavorited
          ? "bg-brand-red text-white hover:bg-brand-red-dark shadow-lg"
          : "border border-brand-red text-brand-red hover:bg-brand-red-soft"
      }`}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
          {isFavorited ? "Removing..." : "Adding..."}
        </>
      ) : (
        <>
          <Heart className={`w-5 h-5 ${isFavorited ? "fill-white" : ""}`} />
          {isFavorited ? "Saved" : "Save to Favorites"}
        </>
      )}
    </button>
  );
};

export default FavoriteButton;
