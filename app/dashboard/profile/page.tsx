"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser, useUpdateUser } from "@/hooks/use-users";
import { CommissionSummary } from "@/components/commissions/commission-summary";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Get user data from React Query
  const {
    data: userData,
    isLoading,
    error: userError,
  } = useUser(user?.id || "");

  // Use mutation hook for updating user
  const updateUser = useUpdateUser();

  // Initialize form state from user data or empty values
  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    staff_id: "",
    role: "",
    contact_number: "",
    address: "",
    profile_image_url: "",
  });

  // Update form data when user data is loaded
  useEffect(() => {
    if (userData) {
      setProfileData({
        full_name: userData.full_name || "",
        email: userData.email || "",
        staff_id: userData.staff_id || "",
        role: userData.role || "",
        contact_number: userData.contact_number || "",
        address: userData.address || "",
        profile_image_url: userData.profile_image_url || "",
      });
    }
  }, [userData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      await updateUser.mutateAsync({
        userId: user.id,
        userData: {
          full_name: profileData.full_name,
          contact_number: profileData.contact_number,
          address: profileData.address,
        },
      });

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (userError || !userData) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center space-y-4">
        <p className="text-red-500">Failed to load profile data</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Profile Info</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              {userData.profile_image_url ? (
                <AvatarImage
                  src={userData.profile_image_url}
                  alt={userData.full_name}
                />
              ) : (
                <AvatarFallback className="text-lg">
                  {userData.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="text-center">
              <h2 className="text-xl font-semibold">{userData.full_name}</h2>
              <p className="text-gray-500">{userData.email}</p>
              <div className="mt-2 inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-medium capitalize text-blue-800">
                {userData.role}
              </div>
            </div>
            <p className="text-sm font-medium">Staff ID: {userData.staff_id}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={profileData.full_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  value={profileData.email}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="staff_id">Staff ID</Label>
                <Input
                  id="staff_id"
                  name="staff_id"
                  value={profileData.staff_id}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  name="role"
                  value={profileData.role}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact_number">Contact Number</Label>
                <Input
                  id="contact_number"
                  name="contact_number"
                  value={profileData.contact_number}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={profileData.address}
                  onChange={handleInputChange}
                />
              </div>
              <Button type="submit" disabled={isSaving || updateUser.isPending}>
                {isSaving || updateUser.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {userData.role === "sales" && (
        <div className="mt-8">
          <CommissionSummary salesPersonId={userData.id} />
        </div>
      )}
    </div>
  );
}
