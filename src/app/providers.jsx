"use client";

import { ClerkProvider } from "@clerk/nextjs";

export default function Providers({ children }) {
  return (
    <ClerkProvider
      appearance={{
        variables: { colorPrimary: "#000000" }, // opcional, para personalizar
      }}
    >
      {children}
    </ClerkProvider>
  );
}
