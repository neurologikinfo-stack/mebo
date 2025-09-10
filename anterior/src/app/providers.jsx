"use client";

import { ClerkProvider } from "@clerk/nextjs";

export default function Providers({ children }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        variables: { colorPrimary: "#000000" },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
