"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";

const EditPropertyButton = ({ propertyId }: { propertyId: string }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      // Fetch property details to check ownership
      fetch(`/api/properties/${propertyId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.sellerId === session.user.id) {
            setIsOwner(true);
          }
        })
        .catch((error) => {
          console.error("Error fetching property details:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [session, propertyId]);

  const handleEditClick = () => {
    router.push(`/properties/${propertyId}/edit`);
  };

  if (!isOwner) {
    return null;
  }

  return (
    <button
      onClick={handleEditClick}
      disabled={isLoading}
      className="flex items-center justify-center gap-2 rounded-full border border-brand-navy px-6 py-3 text-sm font-semibold text-brand-navy transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Pencil className="w-5 h-5" />
      Edit Property
    </button>
  );
};

export default EditPropertyButton;
