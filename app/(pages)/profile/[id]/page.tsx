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
  ArrowRight,
} from "lucide-react";
import { handleInvalidSession } from "@/lib/auth-utils";

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
  console.log("TEST");
  console.log(params.id);
  console.log(session?.user.id);

  const fetchProfile = async (id: string) => {
    try {
      const response = await fetch(`/api/users/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
      } else {
        setError("Failed to load profile");
        handleInvalidSession(router);
        return;
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-white via-emerald-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50 to-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-700 font-medium">
              {error || "Profile not found"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50 to-white py-8">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
          <div className="p-8">
            {/* Profile Header with Avatar and Edit Button */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
              <div className="flex items-start gap-6 mb-6 md:mb-0">
                {/* Avatar */}
                <div className="relative w-32 h-32 rounded-2xl border-4 border-emerald-100 bg-gray-200 overflow-hidden shadow-lg flex-shrink-0">
                  {profile.avatar ? (
                    <Image
                      src={profile.avatar}
                      alt={`${profile.firstName} ${profile.lastName}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-blue-100">
                      <User className="w-16 h-16 text-emerald-600" />
                    </div>
                  )}
                </div>

                {/* Name and Email */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    <span>{profile.email}</span>
                    {profile.isEmailVerified ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  {profile.bio && (
                    <p className="text-gray-700 leading-relaxed max-w-md">
                      {profile.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => router.push(`/profile/${params.id}/edit`)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Edit className="w-5 h-5" />
                Edit Profile
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl mb-3">
                  <Home className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {profile._count?.properties || 0}
                </p>
                <p className="text-sm text-gray-600">Properties</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl mb-3">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {profile._count?.favorites || 0}
                </p>
                <p className="text-sm text-gray-600">Favorites</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl mb-3">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {formatDate(profile.createdAt).split(",")[0]}
                </p>
                <p className="text-sm text-gray-600">Joined</p>
              </div>

              {profile.age && (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl mb-3">
                    <User className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {profile.age}
                  </p>
                  <p className="text-sm text-gray-600">Years old</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Contact Information
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-100">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{profile.email}</p>
              </div>
            </div>

            {profile.phone && (
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{profile.phone}</p>
                </div>
              </div>
            )}

            {profile.age && (
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Age</p>
                  <p className="font-medium text-gray-900">
                    {profile.age} years old
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Account Details
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-gray-700 font-medium">
                Email Verification
              </span>
              {profile.isEmailVerified ? (
                <span className="flex items-center gap-2 text-green-600 font-semibold bg-green-50 px-4 py-2 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  Verified
                </span>
              ) : (
                <span className="flex items-center gap-2 text-gray-500 font-semibold bg-gray-100 px-4 py-2 rounded-lg">
                  <XCircle className="w-5 h-5" />
                  Not Verified
                </span>
              )}
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-gray-700 font-medium">Member Since</span>
              <span className="font-semibold text-gray-900">
                {formatDate(profile.createdAt)}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-gray-700 font-medium">Last Updated</span>
              <span className="font-semibold text-gray-900">
                {formatDate(profile.updatedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => router.push("/my-properties")}
            className="flex items-center justify-center gap-3 p-6 bg-white border-2 border-emerald-600 text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl group"
          >
            <Home className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span>View My Properties</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => router.push("/favorites")}
            className="flex items-center justify-center gap-3 p-6 bg-white border-2 border-red-600 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-all shadow-lg hover:shadow-xl group"
          >
            <Heart className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span>View Favorites</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
