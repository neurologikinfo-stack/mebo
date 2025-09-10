"use client";
import { UserProfile } from "@clerk/nextjs";

export default function AccountPage() {
  return (
    <div className="max-w-4xl mx-auto py-10">
      <UserProfile
        path="/account"
        routing="path"
        appearance={{
          elements: {
            card: "shadow-lg border rounded-xl",
          },
        }}
      />
    </div>
  );
}
