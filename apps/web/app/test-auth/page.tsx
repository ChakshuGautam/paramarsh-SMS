"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestAuthPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  if (!isLoaded) {
    return <div className="p-8">Loading...</div>;
  }

  if (!isSignedIn) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>Not Signed In</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You are not signed in.</p>
            <Button onClick={() => router.push("/sign-in")} className="mt-4">
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Test - Success! ✅</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">User Information:</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
              <p><strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}</p>
              <p><strong>Role:</strong> {user.publicMetadata?.role as string || "Not set"}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">School & Branch Information:</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p><strong>Branch ID:</strong> {typeof window !== "undefined" ? localStorage.getItem('selectedBranchId') : "N/A"}</p>
              <p><strong>School:</strong> {typeof window !== "undefined" ? localStorage.getItem('selectedSchoolName') : "N/A"}</p>
              <p><strong>Branch:</strong> {typeof window !== "undefined" ? localStorage.getItem('selectedBranchDisplayName') : "N/A"}</p>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={() => router.push("/admin")}>
              Go to Admin Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={() => signOut(() => router.push("/sign-in"))}
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}