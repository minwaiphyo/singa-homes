"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { X, Upload, User } from "lucide-react";

type FormState = {
  firstName: string;
  lastName: string;
  age: string; // kept as string in UI, converted before send
  phone: string;
  bio: string;
};

export default function EditProfilePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  const { data: session, status } = useSession();

  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    age: "",
    phone: "",
    bio: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Avatar file state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(""); // preview for newly chosen file
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string>(""); // existing avatar public URL

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/auth/sign-in");
      return;
    }

    if (!id) return;
    if (session?.user?.id !== id) {
      setError("You can only edit your own profile.");
      return;
    }

    let mounted = true;

    (async () => {
      try {
        const res = await fetch(`/api/users/${id}`);
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          setError(err?.error || "Failed to load profile.");
          return;
        }
        const data = await res.json();
        const user = data?.user;
        if (!user) {
          setError("Profile not found.");
          return;
        }
        if (!mounted) return;
        setForm({
          firstName: user.firstName ?? "",
          lastName: user.lastName ?? "",
          age: user.age != null ? String(user.age) : "",
          phone: user.phone ?? "",
          bio: user.bio ?? "",
        });
        setCurrentAvatarUrl(user.avatar ?? "");
      } catch (e) {
        console.error(e);
        setError("Failed to load profile.");
      }
    })();

    return () => {
      mounted = false;
      // revoke preview object URL if any
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, router, session?.user?.id, status]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be less than 2MB");
      return;
    }

    // Cleanup previous preview
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError(null);
  }

  function removeAvatarSelection() {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(null);
    setAvatarPreview("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLoading) return;
    setError(null);
    setSuccess(null);

    if (!id) {
      setError("Missing user id.");
      return;
    }

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }

    setIsLoading(true);
    try {
      // Build multipart FormData
      const fd = new FormData();
      fd.append("firstName", form.firstName.trim());
      fd.append("lastName", form.lastName.trim());
      if (form.age.trim() !== "") fd.append("age", form.age.trim());
      if (form.phone.trim() !== "") fd.append("phone", form.phone.trim());
      if (form.bio.trim() !== "") fd.append("bio", form.bio.trim());
      if (avatarFile) fd.append("avatar", avatarFile);

      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        body: fd, // DO NOT set Content-Type header; browser will set boundary
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        setError(err?.error || "Failed to update profile.");
        setIsLoading(false);
        return;
      }

      setSuccess("Profile updated. Redirecting...");
      // small delay so user sees the message
      setTimeout(() => {
        router.push(`/profile/${id}`);
      }, 1000);
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-emerald-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h1 className="text-2xl font-semibold mb-2">Edit Profile</h1>
          <p className="text-sm text-gray-500 mb-6">
            Update your profile details below.
          </p>

          {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
          {success && (
            <div className="mb-4 text-sm text-green-700">{success}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar preview + upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Profile Photo
              </label>
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border-2 border-gray-200">
                  {avatarPreview ? (
                    // preview of newly selected file
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="object-cover w-full h-full"
                    />
                  ) : currentAvatarUrl ? (
                    <Image
                      src={currentAvatarUrl}
                      alt="Current avatar"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-gray-400" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    {avatarFile ? "Change Photo" : "Upload Photo"}
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleAvatarChange}
                      className="hidden"
                      disabled={isLoading}
                    />
                  </label>

                  {avatarFile && (
                    <button
                      type="button"
                      onClick={removeAvatarSelection}
                      disabled={isLoading}
                      className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium w-full"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                JPEG, PNG, or WebP. Max 2MB.
              </p>
            </div>

            {/* Name fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  First Name
                </label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full rounded-xl border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder="First name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Last Name
                </label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full rounded-xl border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Age</label>
                <input
                  name="age"
                  type="number"
                  value={form.age}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full rounded-xl border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder="Age"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full rounded-xl border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder="+95 9 123 456 789"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                disabled={isLoading}
                rows={4}
                className="w-full rounded-xl border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-white font-medium ${
                  isLoading
                    ? "opacity-60 cursor-not-allowed bg-emerald-400"
                    : "bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 hover:scale-[1.01] transform transition"
                }`}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={() => router.push(`/profile/${id}`)}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
