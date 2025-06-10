
import { useState } from "react";
import { useAuth } from "@/context/ClerkAuthContext";
import { UserProfile } from "@clerk/clerk-react";
import { Card } from "@/components/ui/card";

const ProfilePage = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* User Profile */}
        <div className="lg:w-full">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
            <Card>
              <UserProfile />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
