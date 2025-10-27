// User's profile page by ID

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Edit,
  Heart,
  Home,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  age: number | null;
  phone: string | null;
  bio: string | null;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
  isEmailVerified: boolean;
  _count?: {
    properties: number;
    favorites: number;
  };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");


  const params = useParams();

  useEffect(() => {
    if (params.id) {
      fetchProfile(params.id as string);
    }
  }, [params.id]);

  const fetchProfile = async (id: string) => {
    try {
      const response = await fetch(`/api/users/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
      } else {
        setError("Failed to load profile");
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      setError("An error occurred");
    } finally {
      setIsLoading(false);
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



  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">{error || "Profile not found"}</p>
        </div>
      </div>
    );
  }



  //https://feowsnofuagwjwusfbyq.supabase.co/storage/v1/object/public/Avatar/avatars/40e4aae8-22d0-4a0a-96fe-0c5e0566c465.jpg
  


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          {/* Cover Background */}
          <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-600"></div>

          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            {/* Avatar */}

            <div className="flex items-end justify-between -mt-16 mb-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg">
                  {profile.avatar ? (
                    <Image
                      src={profile.avatar}
                      alt={`${profile.firstName} ${profile.lastName}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-emerald-100">
                      <User className="w-16 h-16 text-emerald-600" />
                    </div>
                  )}
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => router.push("/profile/edit")}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                {"Edit Profile"}
              </button>
            </div>

            {/* Name and Email */}
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {profile.firstName} {profile.lastName}
              </h1>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Mail className="w-4 h-4" />
                <span>{profile.email}</span>
                {profile.isEmailVerified ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="mb-4">
                <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Home className="w-5 h-5 text-emerald-600 mr-1" />
                  <span className="text-2xl font-bold text-gray-900">
                    {profile._count?.properties || 0}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Properties</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Heart className="w-5 h-5 text-red-500 mr-1" />
                  <span className="text-2xl font-bold text-gray-900">
                    {profile._count?.favorites || 0}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Favorites</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Calendar className="w-5 h-5 text-blue-600 mr-1" />
                  <span className="text-sm font-semibold text-gray-900">
                    {formatDate(profile.createdAt).split(" ")[0]}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Joined</p>
              </div>

              {profile.age && (
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <User className="w-5 h-5 text-purple-600 mr-1" />
                    <span className="text-2xl font-bold text-gray-900">
                      {profile.age}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Years old</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Contact Information
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{profile.email}</p>
              </div>
            </div>

            {profile.phone && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{profile.phone}</p>
                </div>
              </div>
            )}

            {profile.age && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="font-medium text-gray-900">{profile.age} years old</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Account Details
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Email Verification</span>
              {profile.isEmailVerified ? (
                <span className="flex items-center gap-1 text-green-600 font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Verified
                </span>
              ) : (
                <span className="flex items-center gap-1 text-gray-500">
                  <XCircle className="w-4 h-4" />
                  Not Verified
                </span>
              )}
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Member Since</span>
              <span className="font-medium text-gray-900">
                {formatDate(profile.createdAt)}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Last Updated</span>
              <span className="font-medium text-gray-900">
                {formatDate(profile.updatedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push("/my-properties")}
            className="flex items-center justify-center gap-2 p-4 bg-white border-2 border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">View My Properties</span>
          </button>

          <button
            onClick={() => router.push("/favorites")}
            className="flex items-center justify-center gap-2 p-4 bg-white border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Heart className="w-5 h-5" />
            <span className="font-medium">View Favorites</span>
          </button>
        </div>
      </div>
    </div>
  );
}