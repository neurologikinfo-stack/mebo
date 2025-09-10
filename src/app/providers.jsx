"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function Providers({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Detecta si el sistema o Tailwind está en dark mode
    if (
      window.matchMedia("(prefers-color-scheme: dark)").matches ||
      document.documentElement.classList.contains("dark")
    ) {
      setIsDark(true);
    }

    // Listener para cambios dinámicos
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: isDark ? "#3b82f6" : "#2563eb", // blue-500 vs blue-600
          colorText: isDark ? "#f3f4f6" : "#1f2937", // gray-100 vs gray-800
          colorBackground: isDark ? "#1f2937" : "#ffffff", // gray-800 vs white
          borderRadius: "0.75rem",
          fontFamily: "Inter, sans-serif",
        },
        elements: {
          card: isDark
            ? "shadow-2xl rounded-xl border border-gray-700 bg-gray-900"
            : "shadow-2xl rounded-xl border border-gray-100 bg-white",

          headerTitle: isDark
            ? "text-xl font-semibold text-gray-100"
            : "text-xl font-semibold text-gray-900",

          headerSubtitle: isDark
            ? "text-sm text-gray-400"
            : "text-sm text-gray-500",

          formFieldInput: isDark
            ? "border border-gray-700 bg-gray-800 text-gray-100 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            : "border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none",

          formButtonPrimary: isDark
            ? "bg-blue-500 hover:bg-blue-400 text-white font-medium py-2 px-4 rounded-md shadow transition"
            : "bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-md shadow transition",

          footerActionLink: isDark
            ? "text-blue-400 hover:text-blue-300 font-medium"
            : "text-blue-600 hover:text-blue-800 font-medium",

          dividerLine: isDark ? "bg-gray-700" : "bg-gray-200",
          dividerText: isDark
            ? "text-xs uppercase text-gray-400 tracking-wider"
            : "text-xs uppercase text-gray-400 tracking-wider",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
